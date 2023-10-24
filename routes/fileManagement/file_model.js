'use strict';

var multer = require('multer');
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, datetimestamp + '-' + file.originalname)
    }
});
var upload = multer({ //multer settings
    storage: storage
}).array('file',3);


module.exports = {
    // storage: storage,
    upload: upload
};