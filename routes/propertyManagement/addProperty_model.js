'use strict';

var mongoose = require('mongoose');

var addPropertySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    kindOfProperty: { type: String, required: true },
    propertyType: { type: String, required: true },
    contactNo:{ type: String, required: true },
    locationDetails: {
        city:{ type: String, required: true },
        society:{ type: String, required: true },
        locality:{ type: String, required: true },
        houseNo:{ type: String, required: false },
    },
    roomDetails:{
        noOfBedRooms: { type: Number, required: false },
        noOfBalconies: { type: Number, required: false },
        noOfBathRooms:{ type: Number, required: false },
    },
   
    areaDetails: {
        carpet:{ type: String, required: true },
        builtUp:{ type: String, required: true },
        superBuiltUp:{ type: String, required: false },
    
    },
    otherRooms : { type: String, required: true },
    furnishedDetails : { type: String, required: true },
    parkingDetails:{
        covered:{ type: Number, required: false },
        open:{ type: Number, required: false },
    },
    floorDetails : {
        total:{ type: Number, required: false },
        propertyOnFloor:{ type: Number, required: false },
    },
    availabilityStatus: { type: String, required: true },
    expectedTimeOfPossesion:{ type: String, required: true },
    photos:[{
        photoName:{ type: String, required: true },
        photoSize:{ type: String, required: false },
    }],   
}, 
{ timestamps: true }, 
{ read: 'secondaryPreferred' }
);

var addProperty = mongoose.model('property', addPropertySchema);

module.exports = {
  addProperty:addProperty
};


