'use strict';

var mongoose = require('mongoose');
    // Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true, unique: true },
}, { timestamps: true }, { read: 'secondaryPreferred' });

var userSchema = new mongoose.Schema({
    firstName: { type: String,required:true },
    lastName: { type: String,required:true },
    businessInfo: { type: String,required:false },
    businessAddress: { type: Object,required:false },
    companyName: { type: String,required:false },
    email: { type: String,required:true,unique:true,lowercase:true },
    password: { type: String, select: false },
    resetPassword: {
        initiated: { type: Boolean },
        token: { type: String },
        expiresOn: { type: Date }
    },
    userStatus: { type: Boolean,required:true,default:false },
    contactNo: { type: Number,required:true },
    pic:{
        uploaded : { type: Boolean, required: true, default: false },
        url : {type : String}
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, required: true },
    roleName: { type: String },
    userOnline: { type: Boolean,required:true,default:false },
    acountDetails:  { 
        acountType: { type: String,required:true,default:'normal' },
        socialId: { type: Number,required: false }
     },
     deviceDetails:  { 
        deviceType: { type: String,required:false },
        deviceId: { type: Number,required: false }
     }
  }, { timestamps: true }, { read: 'secondaryPreferred' });

  
userSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) {
      return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(user.password, salt, function (err, hash) {
          user.password = hash;
          next();
      });
  });
});

userSchema.methods.comparePassword =  (password, dbPass,done) => { 
  bcrypt.compare(password, dbPass, function (err, isMatch) {
      done(err, isMatch);
  });
};


var User = mongoose.model('User', userSchema);
var Role = mongoose.model('Role', roleSchema);

module.exports = {
  User: User,
  Role: Role
};
