var express = require('express');
var router = express.Router();
var logger = require('../../logger/log');
var userManagementCntr = require('../userManagement/user_default');
// var offserPost = require('./../postManagement/post_model').OfferPost;
var addProperty = require('./addProperty_model').addProperty;

var user = require('../userManagement/user_model').User;
var _und = require('underscore');


router.post('/addProperty',function(req,res,next){
    userManagementCntr.checkUserAuthentication(req, res, async function (payload) {
        let userId = payload.sub.toObjectId();
        console.log('userId===',userId);
        let addPropertyData = req.body;
        try {
            var newPost = new addProperty();
            newPost.userId = userId;
            newPost.kindOfProperty = addPropertyData.kindOfProperty;
            newPost.propertyType = addPropertyData.propertyType;
            newPost.contactNo = addPropertyData.contactNo;
            newPost.locationDetails = addPropertyData.locationDetails;
            newPost.roomDetails = addPropertyData.roomDetails;
            newPost.areaDetails = addPropertyData.areaDetails;
            newPost.otherRooms = addPropertyData.otherRooms;
            newPost.furnishedDetails = addPropertyData.furnishedDetails;
            newPost.parkingDetails = addPropertyData.parkingDetails;
            newPost.floorDetails = addPropertyData.floorDetails;
            newPost.availabilityStatus = addPropertyData.availabilityStatus;
            newPost.expectedTimeOfPossesion = addPropertyData.expectedTimeOfPossesion;
            newPost.photos = addPropertyData.photos;

            // newPost.save(function (err,data) {
                newPost.save().then((data, err) => {
                    console.log('err======',err);
                if (err) {
                    // logger.error(err);
                    return console.error(err);
                }
                if(data){
                    res.status(200).send({ message: "Property Added successfully..", status: true });
                    console.log("sendpostnotifycalling");
                }

            });

            
        } catch (error) {
            return console.error(error);
        }

    });
});

module.exports = router;
