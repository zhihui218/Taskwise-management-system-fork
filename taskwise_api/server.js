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
                //? To deal with same users accessing their accounts in multiple tabs / browsers
                socket_id: [socket_id],
                chatRoom: '',
            }
        )
    }
    else {
        // If the user is already online, just add the new socket_id to the existing user's array of socket IDs.
        const existingUser = getUser(user_id);
        if (existingUser && !existingUser.socket_id.includes(socket_id)) existingUser.socket_id.push(socket_id);
    }
}

//? Remove an user when he / she is offline
const removeUser = (socket_id) => {
    let removedUser = null;
    online_user.forEach(user => {
        if (user.socket_id.includes(socket_id)) {
            user.socket_id = user.socket_id.filter(id => id !== socket_id);
            if (user.socket_id.length === 0) removedUser = user;
        }
    })
    // Now remove any users that no longer have any sockets connected.
    online_user = online_user.filter(user => user.socket_id.length > 0);
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
                //? Broadcast the list of "online" user
                io.emit('onlineUser', online_user.map(user => ({ name: user.name, _id: user._id })));
            });

            //? Remove the user when his token expired / logout
            socket.on("disconnect", async() => {
                const removedUser = removeUser(socket.id);
                if(removedUser){
                    //* Update the logout user online status to "false"
                    await UserService.markUserOnlineStatus(removedUser._id, false);
                    //? Broadcast the list of "online" user
                    io.emit('onlineUser', online_user.map(user => ({ name: user.name, _id: user._id })));
                }
            });
        });
        return io;
    },

    sendNotification: function(notification, user_id) {
        if(isUserOnline(user_id)){
            const user = getUser(user_id);
            if(user.socket_id.length > 0){
                const formattedNotification = notificationTransform(notification, user_id);
                //? Real-time emission of the notification to the relevant "ONLINE" user
                user.socket_id.forEach(socketId => io.to(socketId).emit('notification', formattedNotification));
            }
        }
    },
}