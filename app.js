// var createError = require('http-errors');
var express = require('express');
// var path = require('path');
var cors = require('cors');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
// var morgan = require('morgan');
var config = require('./config');
var winstonLogger = require('./logger/log');
// var multer = require('multer');
var expressFileUpload = require('express-fileupload');
var compression = require('compression');
const expressValidator = require('express-validator');
//

mongoose.connect(config.MONGO_URI,{family:4})
    .then(() => console.log('connection successful'))
    .catch((err) => console.error(err));

var app = express();

app.use(cors());
app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressFileUpload());
app.use(compression());
app.use(expressValidator());
// app.use(express.static(path.join(__dirname, 'dist/ojiloji')));
// app.use('/', express.static(path.join(__dirname, 'dist/ojiloji')));

var userDefault = require('./routes/userManagement/user_default');

var userAPI = require('./routes/userManagement/user_controller');

app.use('/', userAPI);


var server = require('http').createServer(app);

// var io = require('socket.io')(server);

server.listen(config.PORT, function() {
    console.log('Socket server listening on ' + config.PORT + ' port');
});

// var socket = require('./socket')(io);

app.use(function(req, res, next) {
    if (config.LOGGER) {
        winstonLogger.info(req.path);
        if (req.method === 'GET') {
            winstonLogger.info('Request Query', req.query);
        }
        if (req.method === 'POST') {
            winstonLogger.info('Request Body', req.body);
        }
        if (req.method === 'DELETE') {
            winstonLogger.info('Request Body', req.body);
        }
        winstonLogger.info('Auth Token', req.headers.authorization);
        next();
    } else {
        next();
    }
});



// create a cors middleware
app.use(function(req, res, next) {
    //set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


userDefault.createDefaultRoles(
//     () => {
//     userDefault.createDefaultUser();
// }
);
userDefault.createDefaultUser();

String.prototype.toObjectId = function() {
    var ObjectId = (require('mongoose').Types.ObjectId);
    return new ObjectId(this.toString());
};




module.exports = app;
