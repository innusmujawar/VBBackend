
var userList = [];
var _und = require('underscore');
var user = require('./routes/userManagement/user_default');

exports = module.exports = function(io){
    io.on('connection', (socket) => {
        console.log('Connected to IO socket');
        socket.on('disconnect', function () {
            var ind = _und.findIndex(userList, { socketId: socket.id });
            if(ind != -1){
                user.markUserOffline(userList[ind].userId);
                //userList.splice(ind, 1);
            }
        });
        socket.on('join', function (data) {
            console.log('Join room ');
            socket.join(data.userId); // We are using room of socket io
            var index = _und.findIndex(userList, { userId: data.userId });
            if(index == -1)
                userList.push({ socketId : socket.id,userId:data.userId});
            else 
                userList[index].socketId = socket.id;

            user.markUserOnline(data.userId);
        });
        socket.on('message', (message) => {
            io.sockets.in(message.userId).emit('getMsg', { message: message.msg });
           
        });
        socket.on('typeEvent', (typingObj) => {
            console.log('SOCKET VAL');
            console.log(typingObj);
            io.sockets.in(typingObj.userId).emit('userTyping', { isTyping: typingObj.isTyping });
        });
        //confirm order socket io notification
        socket.on('order', (message) => {
            io.sockets.in(message.userId).emit('orderMsg', { message: message.msg });
        });
    });
}
