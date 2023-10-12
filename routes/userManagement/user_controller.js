
var express = require('express');
var router = express.Router();
var logger = require('../../logger/log');
var jwt = require('jwt-simple');
var config = require('../../config');
var moment = require('moment');
var role = require('../userManagement/user_model').Role;
var user = require('../userManagement/user_model').User;
var userManagementCntr = require('../userManagement/user_default');
var randomize = require('randomatic');
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
    console.log('Login-body=',req.body);
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
    user.find({ email: email.toLowerCase(), userStatus: true }, '+password').then(function(foundUser,err){
        console.log('foundUser=',err);
        if (err) {
            console.log('a')
            // logger.error(err);
        }
        else {
            console.log('b')
            if (foundUser == null) {
                res.status(200).send({ message: "User not found", status: false });
                // logger.info('Not Found');
              
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
                                    // logger.err(err);
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

