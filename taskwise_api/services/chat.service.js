const ChatModel = require('../models/Chat.model');
const ObjectId = require('mongoose').Types.ObjectId;

class ChatService{
    
    static async insertChatToDB(sender_id, receiver_id, message, ticket_id, isRead){
        try{
            return await ChatModel.create(
                {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    ticket_id: ticket_id,
                    message: message,
                    isRead: isRead
                }
            );
        }catch(error){ throw error;}
    }

    //? Check total number of chat for a specific ticket
    static async totalCounts(ticket_id, user_id){
        try{
            return await ChatModel.countDocuments
            (
                { 
                    ticket_id: ticket_id,
                    deleteBy: { $nin: [user_id] }
                }
            );
        }catch(error){ throw error;}
    }

    //? Retrieve the chat based on the ticket id (descending order to get the latest first)
    static async retrieveChatHistory(ticket_id, page, user_id){
        try{
            return await ChatModel.find({ ticket_id: ticket_id,  deleteBy: { $nin: [user_id] } }, { _id: 0, updatedAt: 0 })
            .sort({ createdAt: -1 })
            .skip((page - 1) * 15)
            .limit(15)
            .exec();
        }catch(error){ throw error; }
    }

    //? Push the `recipient_id` || `sender_id` into the "deleteBy" field of each chat with `ticket_id == ticket_id`
    static async deleteChat(user_id, ticket_id, receiver_id){
        try{
            await ChatModel.updateMany
            (
                { ticket_id: ticket_id }, 
                { $push: { deleteBy: user_id } }
            )

            await ChatModel.deleteMany
            ({$and: 
                [
                    { ticket_id: ticket_id },
                    { deleteBy: { $all: [user_id, receiver_id] } }
                ]
            })
        }catch(error){ throw error; }
    }

    // static async deleteChat(user_id, ticket_id) {
    //     try {
    //         // First, push the user_id into the deleteBy array
    //         await ChatModel.updateMany(
    //             { ticket_id: ticket_id },
    //             { $push: { deleteBy: user_id } }
    //         );
    
    //         // Next, fetch chats where this user_id was pushed to decide if deletion is necessary
    //         const chatsToCheck = await ChatModel.find({ ticket_id: ticket_id });
            
    //         for (let chat of chatsToCheck) {
    //             if (chat.deleteBy.includes(String(chat.sender_id)) && chat.deleteBy.includes(String(chat.receiver_id))) {
    //                 await chat.deleteOne();
    //             }
    //         }
    
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // static async deleteChat(user_id, ticket_id) {
    //     try {
    //         // First, push the user_id into the deleteBy array
    //         await ChatModel.updateMany(
    //             { ticket_id: ticket_id },
    //             { $push: { deleteBy: user_id } }
    //         );
    
    //         // Next, delete chats where both sender_id and receiver_id are in the deleteBy array
    //         await ChatModel.deleteMany({
    //             ticket_id: ticket_id,
    //             deleteBy: { $all: ["$sender_id", "$receiver_id"] }
    //         });
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    // static async deleteChat(user_id, ticket_id) {
    //     try {
    //         // First, add the user_id to the deleteBy array (only if it doesn't already exist)
    //         await ChatModel.updateMany(
    //             { ticket_id: ticket_id },
    //             { $addToSet: { deleteBy: user_id } }
    //         );
    
    //         // Using aggregation to determine which documents need to be deleted
    //         const chatsToDelete = await ChatModel.aggregate([
    //             {
    //                 $match: { ticket_id: ticket_id }
    //             },
    //             {
    //                 $addFields: {
    //                     senderInDeleteBy: { $in: ["$sender_id", "$deleteBy"] },
    //                     receiverInDeleteBy: { $in: ["$receiver_id", "$deleteBy"] }
    //                 }
    //             },
    //             {
    //                 $match: {
    //                     senderInDeleteBy: true,
    //                     receiverInDeleteBy: true
    //                 }
    //             },
    //             {
    //                 $project: { _id: 1 }
    //             }
    //         ]);
    
    //         const deleteIds = chatsToDelete.map(chat => chat._id);
    
    //         // Delete the chats
    //         if (deleteIds.length > 0) {
    //             await ChatModel.deleteMany({ _id: { $in: deleteIds } });
    //         }
    
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    

    static async markChatAsRead(ticket_id, recipient_id){
        try{
            return await ChatModel.updateMany(
                {
                    ticket_id: ticket_id,
                    receiver_id: recipient_id
                }, { isRead: true }
            )
        }catch(error){ throw error;}
    }

    static async markAllAsRead(recipient_id){
        try{
            return await ChatModel.updateMany(
                {
                    receiver_id: recipient_id
                }, { isRead: true }
            )
        }catch(error){ throw error; }
    }

    //? Retrieve overall unread chats grouped by different `sender_id`
    static async retrieveUnreadChat(recipient_id){
        try{
            const pipeline = [
                {
                    $match: {
                        receiver_id: new ObjectId(recipient_id),
                        isRead: false
                    }
                },
                {
                    $group: {
                        _id: {
                            sender_id: "$sender_id",
                            ticket_id: "$ticket_id"
                        },
                        unreadCount: { $sum: 1 }
                    }
                }
            ]

            return await ChatModel.aggregate(pipeline);
        }catch(error){ throw error; }
    }

    //? Delete all the chats related to the ticket IF the ticket is deleted
    static async deleteChatByTicket(ticket_id){
        try{
            return await ChatModel.deleteMany({ ticket_id: ticket_id });
        }catch(error){ throw error; };
    }

    //? Count the number of unread chats of a `receiver` within a ticket
    static async countUnreadChat(ticket_id, recipient_id){
        try{
            const unread_chats = await ChatModel.countDocuments(
                {
                    ticket_id: ticket_id,
                    receiver_id: recipient_id,
                    isRead: false
                }
            )

            return unread_chats;
        }catch(error){ throw error; }
    }
}


module.exports = ChatService;