//? Configuration of socket.io to allow bidirectional real-time communication between server && user
const socketIO = require('socket.io');
let io;
let online_user = [];
const UserService = require("./services/user.service");
const { notificationTransform } = require("./utils/helper");

//? Add a user when he / she is online
const addNewUser = (username, user_id, socket_id) => {
    if(!isUserOnline(user_id)) 
    {
        online_user.push(
            { 
                name: username, 
                _id: user_id, 
                socket_id: socket_id,
                chatRoom: '',
            }
        )
    }
}

//? Remove an user when he / she is offline
const removeUser = (socket_id) => {
    const removedUser = online_user.find(user => user.socket_id == socket_id);
    online_user = online_user.filter(user => user.socket_id !== socket_id);
    return removedUser; 
}

const getUser = (user_id) => { return online_user.find(user => user._id == user_id); }

const isUserOnline = (user_id) => { return online_user.some(user => user._id == user_id); }

module.exports = {
    initialize: function(server) {
        io = socketIO(server, { cors: { origin: '*' } });
        io.on('connection', (socket) => {

            //? Catch the user who login to the system
            socket.on('newUser', async({ username, user_id }) => {
                addNewUser(username, user_id, socket.id);
                //* Update the current user online status to "true"
                await UserService.markUserOnlineStatus(user_id, true);
                //* Tell all clients except of the "Initiator" (user logged in just now) that he/she is online (socket.broadcast.emit())
                socket.broadcast.emit('userOnline', user_id);
                //? Broadcast the list of "online" user
                socket.emit('onlineUser', online_user.map(user => ({ name: user.name, _id: user._id })));
            });

            //? Remove the user when his token expired / logout
            socket.on("disconnect", async() => {
                const removedUser = removeUser(socket.id);
                if(removedUser){
                    //* Update the logout user online status to "false"
                    await UserService.markUserOnlineStatus(removedUser._id, false);
                    //* Tell all clients except of the "Initiator" (user logout just now) that he/she is offline (socket.broadcast.emit())
                    socket.broadcast.emit('userOffline', removedUser._id);
                    //? Broadcast the list of "online" user
                    socket.emit('onlineUser', online_user.map(user => ({ name: user.name, _id: user._id })));
                }
            });
        });
        return io;
    },

    sendNotification: function(notification, user_id) {
        if(isUserOnline(user_id)){
            const formattedNotification = notificationTransform(notification, user_id);
            //? Real-time emission of the notification to the relevant "ONLINE" user
            io.to(getUser(user_id).socket_id).emit('notification', formattedNotification);
        }
    },
}
