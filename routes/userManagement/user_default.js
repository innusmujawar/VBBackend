var exports = module.exports = {};
var logger = require('../../logger/log');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var config = require('../../config');
var moment = require('moment');
var role = require('../userManagement/user_model').Role;
var user = require('../userManagement/user_model').User;

//Checking user authentication by generated token
exports.checkUserAuthentication = function (req, res, next) {
    console.log('+++++++++++++++++++++=')
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized', status: false });
    }
    try {
        var token = req.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);
        if (payload.exp <= moment().unix()) {
            return res.status(440).send({ message: 'Login Time-out', status: false });
        }
    }
    catch (e) {
        // logger.error(e.stack);
        return res.status(502).send({ message: 'Unknown Error', status: false });
    }
    next(payload);
}

//create default role name
exports.createDefaultRoles = function (next) {
    var roleNames = [
        { roleName: 'admin' },
        { roleName: 'normalUser' }
    ];
    var ctr = 0;
    roleNames.forEach(async function (singleRole) {
        // console.log("==========", singleRole)
        await role.updateOne({ roleName: singleRole.roleName }, singleRole, { upsert: true }, function (err, updated) {
            ctr++;
            if (err) {
                console.log("1. err", err)
                // logger.error(err);
            }
            else {
                if (ctr == roleNames.length) {
                    // logger.info('Added Default Roles')
                    next();
                }
            }
        });
    });
}

exports.createDefaultUser = function () {
    var roleName = 'admin';
    // role.findOne({ roleName: roleName }, function (err, roleData) {
        role.findOne({ roleName: roleName }).then(function(roleData,err){
        if (err) {
            console.log("2. err", err)
            // logger.error(err);
        } else {
            console.log('RoleDataDefaultUserCreation=', roleData)
            var defaultUser = {
                roleId : roleData._id,
                email: "jhon@gmail.com",
                password: "Pass@123",
                firstName: "Jhon",
                lastName: "Stark",
                contactNo: 9090909090,               
                businessAddress: {
                    adr_address: "<span class=\"locality\">Delhi</span>, <span class=\"country-name\">India</span>",
                    "url": "https://maps.google.com/?q=Delhi,+India&ftid=0x390d047309fff32f:0xfc5606ed1b5d46c3",
                    "id": "9e280bae198a170435c5dff3faa5ef5e29328bc8",
                    "name": "Delhi",
                    "lng": 77.2217831,
                    "lat": 28.6862738
                },
                pic: {
                    "uploaded": false
                },
                userStatus : true,
                acountDetails:{
                    acountType : 'normal'
                }
            }
            
            // console.log(roleData)
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(defaultUser.password, salt, function (err, hash) {
                    defaultUser.password = hash;
                    // user.updateOne({ email: defaultUser.email }, defaultUser, { upsert: true }, function (err, updated) {
                        user.updateOne({ email: defaultUser.email }, defaultUser, { upsert: true }).then(function(updated,err){
                        if (err) {
                            console.log("2. err", err)
                            // logger.error(err);
                        }
                        else {
                            // logger.info('Added Default User');
                        }
                    });
                });
            });
        }
    });
}

exports.checkUserRoleName = function (userId, next) {
    // user.findOne({ _id: userId }, (err, userData) => {
        user.findOne({ _id: userId }).then(function(userData,err){
        if (err) {
            logger.error(err.stack);
        }
        else {
            if (userData == null) {
                logger.info('User Not Found');
            }
            else {
                // console.log('=-=-=-=-=-=-=-', userRole)
                // role.findOne({ _id: userData.roleId }, (err, roleData) => {
                    role.findOne({ _id: userData.roleId }).then(function(roleData,err){
                    if (err) {
                        logger.error(err.stack);
                    }
                    else {
                        if (roleData == null) {
                            logger.info('Not Found');
                        }
                        else {
                            next(roleData);
                        }
                    }
                });
            }
        }
    });
}


//Update online status
exports.markUserOnline = function(userId){
    console.log(userId);
    let findData = {
        _id:userId
    }

    let updateData = {
        userOnline:true
    }

    user.findOneAndUpdate(findData, updateData, function (err, data) {
        if (err) {
            console.error(err);
            logger.error(err);
        }
        else {
            console.log('USER ONLINE');
        }
    });
}

//Update online status
exports.markUserOffline = function(userId){
    console.log(userId);
    let findData = {
        _id:userId
    }

    let updateData = {
        userOnline:false
    }

    user.findOneAndUpdate(findData, updateData, function (err, data) {
        if (err) {
            logger.error(err);
            console.error(err);
        }
        else {
            console.log('USER OFFLINE');
        }
    });
}
