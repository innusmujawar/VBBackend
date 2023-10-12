
var express = require('express');
var router = express.Router();
var logger = require('../../logger/log');
var jwt = require('jwt-simple');
var config = require('../../config');
var moment = require('moment');
var role = require('../userManagement/user_model').Role;
var user = require('../userManagement/user_model').User;
var userManagementCntr = require('../userManagement/user_default');
var followers = require('./../followersManagement/followers_model').Followers;
var offserPost = require('./../postManagement/post_model').OfferPost;
var randomize = require('randomatic');
var geodist = require('geodist');
var userRating = require('./../notificationManagement/notification_model').userRating;
// var msg91 = require("msg91")(config.API_KEY, config.SENDER_ID, config.ROUTE_NO);
var _und = require('underscore');
//
var nodemailer = require('nodemailer');
//var randomize = require('randomatic');
var transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: config.MAIL.EMAIL_ID,
        pass: config.MAIL.EMAIL_PWD
    },
    tls: {
        rejectUnauthorized: false
    }
});

var projectLink = "";
if (config.NODE_ENV == 'development') {
    projectLink = config.DEV_URL;
}
else {
    projectLink = config.PROD_URL;
}

var mailOptions = {
    from: config.MAIL.EMAIL_ID, // sender address
};
//

router.post('/auth/signup',function(req,res,next){
    var userData = req.body;
    console.log(userData)
    var otp = randomize('0', 4);
    var smsToken = randomize('Aa0!', 50);
    userData.roleName = 'normalUser';
    if (!userData.email || !userData.firstName || !userData.lastName || !userData.password) {
        res.status(400).send({ message: "Bad Request", status: false });
    }
    // role.findOne({ roleName: userData.roleName }, function (err, data) {
        role.findOne({ roleName: userData.roleName }).then(function(data,err){
        if (err) {
            res.status(400).send({ err: err, status: false });
        } else {
            var newUser = new user();
            newUser.firstName = userData.firstName;
            newUser.lastName = userData.lastName;
            newUser.contactNo = userData.contactNo;
            newUser.email = userData.email;
            newUser.password = userData.password;
           
            if(userData.hasOwnProperty('acountType')){
                newUser.acountDetails.acountType = userData.acountType;
                newUser.acountDetails.socialId = userData.socialId;
                newUser.userStatus = true;
                console.log('bAddressInside='+userData.businessAddress);
            }
            newUser.roleId = data._id;            
            newUser.save().then(
                () => {
                  res.status(201).json({
                    message: 'User Registered successfully!'
                  });
                }
              ).catch(
                (error) => {
                  res.status(400).json({
                    error: error
                  });
                }
              );
        }
    });
});

router.post('/auth/login',function(req,res,next){
    var email = req.body.email;
    var contactNo = req.body.contactNo;
    var password = req.body.password;
    let userIdType;
    if ( req.body.hasOwnProperty('email')) {
        userIdType = { email: email.toLowerCase(), userStatus: true } ;
    }else{
        userIdType = { contactNo: contactNo, userStatus: true };
    }
    // "$or": [ { email: email }, { phone: phone} ]
    // console.log('Body=',req.body);
    if (!userIdType || !password) {
        res.status(400).send({ message: "Bad Request", status: false });
    }
    user.findOne(userIdType, '+password').then(function(foundUser,err){
        if (err) {
            console.log('a')
            logger.error(err);
        }
        else {
            console.log('b')
            if (foundUser == null) {
                res.status(200).send({ message: "User not found", status: false });
                logger.info('Not Found');
              
            }
            if(foundUser){
                console.log('d')
            foundUser.comparePassword(password, function (err, isMatch) {
                if (err) {
                    console.log('e')
                    // logger.info('Incorrect Credentials');
                    res.status(401).send({ message: "Incorrect Credentials", status: false });
                }
                else {
                    if (!isMatch) {
                        console.log('f')
                        // logger.info('Incorrect Credentials');
                        res.status(401).send({ message: "Incorrect Credentials", status: false });
                    } else {

                        if (foundUser) {
                            console.log("found User Id="+foundUser._id);                    

                            userManagementCntr.checkUserRoleName(foundUser._id, function (roleName) {

                                if (err) {
                                    console.log('g')
                                    logger.err(err);
                                } else {
                                    console.log('roleName.roleName=',roleName.roleName);
                                    foundUser.roleName = roleName.roleName;
                                    var token = createToken(foundUser);
                                    console.log('token=',token);
                                    res.status(200).send({ message: 'Login successfull', status: true, token: createToken(foundUser), data: foundUser });
                                }
                            });
                        }
                    }
                }
            });
        }
        }
    });
    // user.findOne({ email: email.toLowerCase(), userStatus: true }, '+password', function (err, foundUser) {
    //     if (err) {
    //         console.log('a')
    //         logger.error(err);
    //     }
    //     else {
    //         console.log('b')
    //         if (foundUser == null) {
    //             console.log('c')
    //             logger.info('Not Found');
    //             res.status(200).send({ message: "User not found", status: false });
    //         }
    //         if(foundUser){
    //             console.log('d')
    //         foundUser.comparePassword(password, function (err, isMatch) {
    //             if (err) {
    //                 console.log('e')
    //                 logger.info('Incorrect Credentials');
    //                 res.status(401).send({ message: "Incorrect Credentials", status: false });
    //             }
    //             else {
    //                 if (!isMatch) {
    //                     console.log('f')
    //                     logger.info('Incorrect Credentials');
    //                     res.status(401).send({ message: "Incorrect Credentials", status: false });
    //                 } else {

    //                     if (foundUser) {
    //                         console.log("gf="+foundUser._id);
    //                         console.log('h');

    //                         userManagementCntr.checkUserRoleName(foundUser._id, function (roleName) {

    //                             if (err) {
    //                                 console.log('g')
    //                                 logger.err(err);
    //                             } else {
    //                                 console.log('h');
    //                                 foundUser.roleName = roleName.roleName;
    //                                 var token = createToken(foundUser);
    //                                 res.status(200).send({ message: 'Login successfull', status: true, token: createToken(foundUser), data: foundUser });
    //                             }
    //                         });
    //                     }
    //                 }
    //             }
    //         });
    //     }
    //     }
    // });

});

router.get('/getUserDetails',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        var userId;
        var loggedInUserId = payload.sub.toObjectId();
        if (req.query.hasOwnProperty('userId')) {
            userId = req.query.userId.toObjectId();
        } else {
            userId = payload.sub.toObjectId();
        }
        var findData = { _id: userId };
        console.log("userIdchecking"+userId);
        user.aggregate(
            [
                { $match: findData }
            ]
            , function (err, data) {
                if (err) {
                    logger.error(err);
                    res.status(400).send({ err: err });
                } else {

                    if (data.length > 0) {
                        if (req.query.hasOwnProperty('userId')) {
                            followers.find({ userId: userId, followingUserId: loggedInUserId }).count(function (err, followCount) {
                                if (err) {
                                    logger.error(err);
                                    res.status(400).send({ err: err });
                                } else {
                                    if (followCount == 0) {
                                        data[0].isFollowing = false;
                                    } else {
                                        data[0].isFollowing = true;
                                    }

                                    userRating.findOne({byUserId:loggedInUserId,toUserId:userId},function (err, userRatingData){
                                        if (err) {
                                            logger.error(err);
                                        } else {
                                            if(userRatingData){
                                                data[0].user_rating = userRatingData['rating'];
                                            }else{
                                                data[0].user_rating = 0;
                                            }
                                            res.status(200).send({ message: "User Found", status: true, data: data[0] });
                                        }
                                    });

                                }
                            })
                        } else {
                            res.status(200).send({ message: "User Found", status: true, data: data[0] });
                        }
                    } else {
                        res.status(200).send({ message: "User Not Found", status: false });
                    }

                }
            });
    });
});

router.get('/getUserDetailsByToken',function(req,res,next){
    var token = req.query.token;
    if (!token) {
        logger.error("Bad Request");
        res.status(400).send({ message: "Bad Request" });
    }
    user.findOne({ 'resetPassword.token': token, 'resetPassword.initiated': true }, function (err, foundUser) {
        if (err) {
            logger.error(err.stack);
            return res.status(502).send({ message: 'Unknown Error', status: false });
        }
        else {
            if (foundUser == null) {
                logger.info('Not Found');
                return res.status(200).send({ message: 'Not Found', status: false });
            }
            else {
                if (new Date(foundUser.resetPassword.expiresOn) < new Date()) {
                    return res.status(200).send({ message: 'Token Expired', status: false });
                }
                return res.status(200).send({ message: 'Found', data: foundUser, status: true });
            }
        }
    });
});

router.post('/updateProfilePic',function(req,res,next){
    var userId;
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        userId = payload.sub.toObjectId();

        var url = req.body.url;
        if (!url) {
            res.status(400).send({ message: "Bad Request", status: false });
        }
        user.findByIdAndUpdate({ _id: userId }, { $set: { 'pic.uploaded': true, 'pic.url': url } }, function (err, updated) {
            if (err) {
                logger.error(e.stack);
                return res.status(502).send({ message: 'Unknown Error', status: false });
            }
            else {
                return res.status(200).send({ message: 'User Profile Updated', status: true });
            }
        });
    });
});

router.post('/updateUser',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        var userId = payload.sub.toObjectId();
        var updateData = req.body;
        if (!updateData.firstName || !updateData.lastName || !updateData.contactNo
            || !updateData.businessInfo) {
           // logger.error("Bad Request");
            res.status(400).send({ message: "Bad Request", status: false });
        }
        var findData = {
            _id: userId
        }
        user.findByIdAndUpdate(findData, updateData, { new: true }, function (err, updated) {
            if (err) {
                logger.error(err);
                res.status(400).send({ err: err, status: false });
            }
            else {
                res.status(200).send({ message: "Updated", status: true, data: updated })
            }
        });
    });
});

router.post('/changePassword',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        var userId = payload.sub;
        var passwordData = req.body;
        if (!passwordData.oldPassword || !passwordData.newPassword) {
            res.status(400).send({ message: "Bad Request", status: false });
        }
        var password = passwordData.oldPassword;
        user.findOne({ _id: userId }, '+password', function (err, foundUser) {
            if (err) {
                logger.error(err.stack);
                return res.status(502).send({ message: 'Unknown Error', status: false });
            }
            else {
                foundUser.comparePassword(password, function (err, isMatch) {
                    if (err) {
                        logger.error(err.stack);
                        return res.status(502).send({ message: 'Unknown Error', status: false, err: err });
                    }
                    else {
                        console.log(isMatch)
                        if (!isMatch) {
                            return res.status(401).send({ message: 'Please check old password', status: false });
                        }
                        else {
                            foundUser.password = passwordData.newPassword;
                            foundUser.save(function (err, saved) {
                                if (err) {
                                    logger.error(err.stack);
                                    return res.status(502).send({ message: 'Unknown Error', status: false, err: err });
                                }
                                else {
                                    res.status(200).send({ message: 'Password Changed', status: true });
                                }
                            });
                        }
                    }
                });
            }
        });
    });
});

router.get('/getAllUsers',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        var userId = payload.sub.toObjectId();
        var userQueryData = req.query;
        var conditionData;
        var distArrayOutput = [];
        var locationResArray = [];
        var followerResArray = [];
        var online_user_status = null;
        userManagementCntr.checkUserRoleName(payload.sub, function (roleData) {
        user.findOne({ _id: userId }, function (err, userData) {
            if (err) {
                logger.error(err);
                res.status(400).send({ err: err });
            } else {

                // console.log(userData);

                var findData = {

                }
                var sort = {
                    createdAt: -1
                }

                var lookup = {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                };

                var project = {
                    '_id': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'updatedAt': 1,
                    'createdAt': 1,
                    'pic': 1,
                    'contactNo': 1,
                    'email': 1,
                    'businessInfo': 1,
                    'companyName': 1,
                    'businessAddress': 1,
                    'userOnline': 1
                }

                var unwind = "$userDetails";
                var selectDataConditon = [];

                if (userQueryData.hasOwnProperty('pageNo')) {
                    var pageNo = userQueryData.pageNo;
                    console.log("Page no " + pageNo);

                    var itemsPerPage = 12;
                    console.log("Items per page " + itemsPerPage);

                    var limit = itemsPerPage;

                    var skip = itemsPerPage * (pageNo - 1);
                    console.log("skip " + skip);
                    findData = {
                        $and:[{_id: { $nin: [userId] }},{roleId : roleData.id.toObjectId()}]
                    }
                    selectDataConditon = [
                        { $match: findData },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        { $project: project }
                    ]

                }
                if (userQueryData.hasOwnProperty('name')) {
                    var name = req.query.name;
                    var q = "^" + name;
                    findData = {
                        $or:[{firstName: { $regex: q, $options: "i" }},{lastName: { $regex: q, $options: "i" }}],
                        _id: { $nin: [userId] }
                    }
                    selectDataConditon = [
                        { $match: findData },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },
                        { $project: project }
                    ]
                }

                if (!userQueryData.hasOwnProperty('pageNo')) {
                    findData = { _id: { $nin: [userId] } }
                    selectDataConditon = [
                        { $match: findData },
                        { $sort: sort },
                        { $project: project }
                    ]
                }

                console.log(findData);

                // selectDataConditon = [
                //     { $match: findData },
                //     { $sort: sort },
                //     { $skip: skip },
                //     { $limit: limit },
                //     { $project: project }
                // ]

                user.aggregate(selectDataConditon, function (err, data) {
                    if (err) {
                        logger.error(err);
                        res.status(400).send({ err: err });
                    } else {
                        if (data.length == 0) {
                            res.status(200).send({ message: "No Users Found", status: false });
                        } else {
                            var ctr = 0;
                            data.forEach(function (singleData) {
                                ctr++
                                followers.find({ followingUserId: userId, userId: singleData._id }).count(function (err, followerDataCount) {
                                    ctr--
                                    if (err) {
                                        logger.error(err);
                                    } else {
                                        if (followerDataCount == 0)
                                            singleData.isUserFollower = false;
                                        else
                                            singleData.isUserFollower = true
                                        if (ctr == 0) {
                                            data.forEach(function (singleData) {
                                                ctr++
                                                followers.find({ followingUserId: singleData._id, userId: userId }).count(function (err, followedDataCount) {
                                                    ctr--
                                                    if (err) {
                                                        logger.error(err);
                                                    } else {
                                                        if (followedDataCount == 0)
                                                            singleData.isUserFollowed = false;
                                                        else
                                                            singleData.isUserFollowed = true
                                                        if (ctr == 0) {
                                                            if (req.body.hasOwnProperty('userConditions')) {
                                                                conditionData = req.body.userConditions;
                                                                if (conditionData.hasOwnProperty('locationWithin')) {
                                                                    data.forEach(function (singleData) {
                                                                        var dist = geodist({ lat: userData.businessAddress.lat, lon: userData.businessAddress.lng },
                                                                            { lat: singleData.businessAddress.lat, lon: singleData.businessAddress.lng }, { limit: conditionData.locationWithin })
                                                                        // console.log(dist)
                                                                        if (dist) {
                                                                            var indexOfPost = (_und.where(distArrayOutput, { _id: singleData._id })).length;
                                                                            if (indexOfPost == 0)
                                                                                locationResArray.push(singleData);
                                                                        }
                                                                    });
                                                                }

                                                                if (conditionData.hasOwnProperty('follower')) {
                                                                    console.log('User conditions found');
                                                                    data.forEach(function (singleData) {
                                                                        if (conditionData.follower == true) {
                                                                            if (singleData.isUserFollower == true) {
                                                                                var indexOfPost = (_und.where(distArrayOutput, { _id: singleData._id })).length;
                                                                                if (indexOfPost == 0)
                                                                                    followerResArray.push(singleData);
                                                                            }
                                                                        } else {
                                                                            if (singleData.isUserFollowed == true) {
                                                                                var indexOfPost = (_und.where(distArrayOutput, { _id: singleData._id })).length;
                                                                                if (indexOfPost == 0)
                                                                                    followerResArray.push(singleData);
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    distArrayOutput = data;
                                                                }

                                                                if (conditionData.hasOwnProperty('follower') && conditionData.hasOwnProperty('locationWithin')) {
                                                                    distArrayOutput = _und.intersection(locationResArray, followerResArray);
                                                                } else if (!conditionData.hasOwnProperty('follower') && conditionData.hasOwnProperty('locationWithin')) {
                                                                    distArrayOutput = locationResArray;
                                                                } else if (!conditionData.hasOwnProperty('locationWithin') && conditionData.hasOwnProperty('follower')) {
                                                                    distArrayOutput = followerResArray;
                                                                }
                                                                console.log(distArrayOutput);
                                                                console.log(locationResArray);
                                                                console.log(followerResArray);
                                                                if(conditionData.hasOwnProperty('userOnline')){
                                                                    online_user_status = conditionData.userOnline;
                                                                }
                                                            }
                                                            else {
                                                                distArrayOutput = data;
                                                            }
                                                            var finalOutputArray = [];
                                                            if(online_user_status != null){
                                                                distArrayOutput.forEach(function(singleDistOutput){
                                                                    if(singleDistOutput.userOnline == online_user_status){
                                                                        finalOutputArray.push(singleDistOutput);
                                                                    }
                                                                });
                                                            }else{
                                                                finalOutputArray = distArrayOutput;
                                                            }
                                                            user.find({ _id: { $nin: [userId] } }).count(function (err, userCount) {
                                                                res.status(200).send({ message: "Users Found", status: true, data: finalOutputArray, currentCount: data.length, totalCount: userCount });
                                                            });
                                                        }
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            });

                        }
                    }
                });
            }
        });
    });
    });
});


router.delete('/deleteUser',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, function (payload) {
        var userId = payload.sub.toObjectId();
        userManagementCntr.checkUserRoleName(payload.sub, function (roleName) {
            console.log(roleName);
            var id;
            if (!req.query.id) {
                logger.error("Bad Request");
                res.status(400).send({ message: "Bad Request", status: false });
            }
            if (req.query.hasOwnProperty('id')) {
                id = req.query.id;
            }
            console.log(id);
            if (roleName.roleName != 'admin') {
                res.status(403).send({ message: "Forbidden", status: false });
            } else {
                user.findByIdAndRemove({ _id: id }, function (err, data) {
                    if (err) {
                        logger.error(err);
                        res.status(400).send({ err: err, status: false });
                    }
                    else {
                        if (data) {
                            offserPost.remove({ userId: id }, function (err, removeOfferPost) {
                                if (err) {
                                    logger.error(err);
                                    res.status(400).send({ err: err });
                                } else {
                                    var deleteFollower = {
                                        $or: [{ userId: id }, { followingUserId: id }]
                                    }
                                    followers.remove(deleteFollower, function (err, removeOfferPost) {
                                        if (err) {
                                            logger.error(err);
                                            res.status(400).send({ err: err });
                                        } else {
                                            res.status(200).send({ message: "User successfully deleted!!!", status: true, data: data });
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            res.status(200).send({ message: "No user user found with this id", status: false });
                        }
                    }
                });
            }

        });
    });
});


router.post('/forgetPassword',function(req,res,next){
     var email = req.body.email;

    console.log("forgetpassemailusercontroller="+email);
    if (!email) {
        logger.error("Bad Request");
        res.status(400).send({ message: "Bad Request Inns" });
    }
    user.findOne({ email: email.toLowerCase() }, function (err, foundUser) {
        if (err) {
            logger.error(err.stack);
            return res.status(502).send({ message: 'Unknown Error', status: false });
        }
        else {
            if (foundUser == null) {
                logger.info('Not Found');
                return res.status(200).send({ message: 'Not Found', status: false });
            }
            else {
                foundUser.resetPassword.initiated = true;
                foundUser.resetPassword.expiresOn = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
                foundUser.resetPassword.token = randomize('Aa0', 50);
                foundUser.save(function (err, saved) {
                    if (err) {
                        logger.error(err.stack);
                        return res.status(502).send({ message: 'Unknown Error', status: false, err: err });
                    }
                    else {
                        //send reset password link to user
                       //  mailNotificationCntr.sendResetPasswordEmail(foundUser, foundUser.resetPassword.token);
                        //
                      //  user=foundUser;
                       // token=foundUser.resetPassword.token;
                        var link = "";
                            if (config.NODE_ENV == 'development') {
                                link = config.DEV_URL + '/forget-password?token=' + foundUser.resetPassword.token;
                                console.log("forgot pass link localhost");
                            }
                            else {
                                // link = config.PROD_URL + '/forget-password?token=' + foundUser.resetPassword.token;
                                link = 'oglog.in/#' + '/forget-password?token=' + foundUser.resetPassword.token;
                                console.log("forgot pass link in production");
                            }
                            mailOptions.to = foundUser.email;
                            console.log("forgot pass link"+foundUser.email);

                            mailOptions.subject = "Reset Password";
                            mailOptions.html =
                                '<div>' +
                                'Click on link to Reset Password <a href = ' + link + '>Reset Password</a>' +
                                '</div>'
                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err) {
                                    logger.error(err.stack);
                                    console.log(err.stack);
                                }
                                else {
                                    console.log('Email Sent')
                                    logger.info("Email Sent ", info);
                                }
                                console.log("in transport. sendmail");
                            });


                        //
                        return res.status(200).send({ message: 'Link Sent', status: true });
                    }
                });
            }
        }
    });
});


router.post('/resetPassword',function(req,res,next){
    console.log("resetpassword in api");
    var passwordResetData = req.body;
    if (!passwordResetData.token || !passwordResetData.password) {
        logger.error("Bad Request");
        res.status(400).send({ message: "Bad Request" });
    }
    user.findOne({ 'resetPassword.token': passwordResetData.token, 'resetPassword.initiated': true }, function (err, foundUser) {
        if (err) {
            logger.error(err.stack);
            return res.status(502).send({ message: 'Unknown Error', status: false });
        }
        else {
            if (foundUser == null) {
                logger.info('Not Found');
                return res.status(200).send({ message: 'Not Found', status: false });
            }
            else {
                if (new Date(foundUser.resetPassword.expiresOn) < new Date()) {
                    return res.status(200).send({ message: 'Token Expired', status: false });
                }
                foundUser.resetPassword.initiated = false;
                foundUser.resetPassword.token = null;
                foundUser.password = passwordResetData.password;
                foundUser.save(function (err, saved) {
                    if (err) {
                        logger.error(err.stack);
                        return res.status(502).send({ message: 'Unknown Error', err: err, status: false });
                    }
                    else {
                        return res.status(200).send({ message: 'Updated', status: true });
                    }
                });
            }
        }
    });
});


module.exports = router;
/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(50, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

function invalidateToken(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}

