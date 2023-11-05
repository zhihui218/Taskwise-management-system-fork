// CRUD of "User" to MongoDB
const ObjectId = require('mongoose').Types.ObjectId;
const NotificationModel = require("../models/Notification.model");

class NotificationService {
    
    //? Create notification for each necessary action
    static async create(notification) {
        try{
            return await NotificationModel.create(notification);
        }catch(error){ throw error;}
    }

    //? Count the total number of notification for the existing user
    static async countNotification(user_id){
        try{
            //* When there is at least one element with "user_id" == user_id, increment the count
            return await NotificationModel.countDocuments({ "recipients.user_id": user_id });
        }catch(error){ throw error; }
    }

    //? Count the total number of "UNREAD" notification for the existing user
    static async countUnreadNotification(user_id){
        try{
            //* Increment count if the element inside `recipients` satisfies condition: ("user_id" == user_id && "isRead" == false)
            return await NotificationModel.countDocuments(
            { 
                "recipients": { 
                    $elemMatch: {
                        user_id: user_id,
                        isRead: false,
                }}
            }
            )
        }catch(error){ throw error; }
    }

    //? Retrieve the notification of a specific user
    static async getNotification(user_id, numOfDocs, startIndex){
        try{
            const pipeline = [
                { $match: { "recipients.user_id": new ObjectId(user_id) } },
                //* Divide one document into multiple documents based on each value of its selected array property (e.g., 'recipients' in each 'notification' document)
                { $unwind: "$recipients" },
                { $match: { "recipients.user_id": new ObjectId(user_id) } },
                { $sort: { timestamp: -1 } },
                { $skip: startIndex },
                { $limit: numOfDocs }
            ]
    
            return await NotificationModel.aggregate(pipeline);
        }catch(error){ throw error; }
    }

    //? When a user delete a notification, delete his "_id" from the `recipients` of 'notification' doc
    static async removeUserFromNotification(notification_id, user_id){
        try{
            const notification =  await NotificationModel.findByIdAndUpdate(notification_id, 
                {
                    $pull: { recipients: { user_id: user_id}}
                }, { new: true });

            //? If the `recipients` of the updated notification has no more element, means there's no any user that will receive it
            if(notification.recipients.length == 0) await NotificationModel.findByIdAndDelete(notification._id);
            return true;
        }catch(error){ throw error; }
    }

    //? When a user click "Clear All" link, delete his "_id" from the `recipients` of ALL 'notification' docs
    static async removeAllNotification(user_id){
        try{
            //* 1. Remove the user's _id from all notifications
            await NotificationModel.updateMany( 
                { 'recipients.user_id': user_id }, 
                { $pull: { recipients: { user_id: user_id } } }
            );

            //* 2. Delete all notifications where recipients array is empty
            return await NotificationModel.deleteMany({ recipients: { $eq: [] } });
            
        }catch(error){ throw error; }
    }

    //? When a user click on a notification, update his/her `isRead` in the `recipients` to "true"
    static async markAsRead(notification_id, user_id){
        try{
            return await NotificationModel.findOneAndUpdate(
                {
                    _id: notification_id,
                    'recipients.user_id': user_id
                }, 
                {
                    //? $ => Identify & update the specific element in `recipients` array that matches the conditions
                    $set: { 'recipients.$.isRead': true }
                },
                { new: true }
            )
        }catch(error){ throw error; }
    }
}

module.exports = NotificationService;