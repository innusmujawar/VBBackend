var exports = module.exports = {};
var userManagementCntr = require('../userManagement/user_default');
var express = require('express');
var router = express.Router();
var logger = require('../../logger/log');
var config = require('../../config');
// var storage = require('../fileManagement/file_model').storage;
var upload = require('../fileManagement/file_model').upload;
var AWS = require('aws-sdk');
// var uuidv1 = require('uuid/v1');
var awsURL;
var s3bucket;
var bucketName;

awsURL = config.DEV_AWSURL;
s3bucket = new AWS.S3(config.DEV_S3STORAGE);
bucketName = config.DEV_BUCKET;


router.post('/uploadImage',(req,res) => {   
    upload(req,res,(err) => {
        if(err){
            res.status(400).send({message:'More than three files upladed!'});
        }
        else{
            var file = req.files;
            userManagementCntr.checkUserAuthentication(req, res, (payload) => {
                res.status(200).send({ filesUploaded:file,status: true });
            });
        }
        
    });
    
});

module.exports = router;