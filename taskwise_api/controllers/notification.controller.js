const NotificationService = require("../services/notification.service");
const UserService = require("../services/user.service");
const { type, notification_type } = require('../constants');
const { sendNotification } = require('../server');
const { notificationTransform } = require('../utils/helper');
const { model } = require("mongoose");

exports.retrieveNotification = async(req, res, next) => {
    try{
        const user_id = req.params._id;
        //? Retrieve the documents 5 by 5 by skipping certain amount of documents
        const skip = parseInt(req.query.skip); //* E.g., Skipping first 8 documents
        const limit = 5;

        const endIndex = skip + limit; //* E.g., If skipping first 8 documents, it takes 9th - 13th documents


        const totalNotifications = await NotificationService.countNotification(user_id);
        const notifications = await NotificationService.getNotification(user_id, limit, skip);

        res.status(200).json(
            {
                numOfDocs: totalNotifications,
                docs: notifications,
                nextPage: endIndex < totalNotifications ? true : false,
                // previousPage: startIndex > 0 ? page - 1 : null,
            }
        );

    }catch(error){
        res.status(500).json(undefined);
        return next(error);
    }
}

exports.countUnreadNotification = async(req, res, next) => {
    try{
        const user_id = req.params._id;
        const unreadNots = await NotificationService.countUnreadNotification(user_id);
        res.status(200).json(unreadNots);

    }catch(error){
        res.status(500).json(undefined);
        return next(error);
    }
}

exports.removeUserFromNotification = async(req, res, next) => {
    try{
        const notification_id = req.params.notification_id;
        const { user_id } = req.body;
        //? Remove the user from `recipients` of a specific `notification`
        await NotificationService.removeUserFromNotification(notification_id, user_id);
        res.status(200).json(true);

    }catch(error){
        res.status(500).json(false);
        return next(error);
    }
}

exports.markAsRead = async(req, res, next) => {
    try{
        const notification_id = req.params.notification_id;
        const { user_id } = req.body;
        //? Remove the user from `recipients` of a specific `notification`
        const result = await NotificationService.markAsRead(notification_id, user_id);
        const transformNotification = notificationTransform(result, user_id);
        res.status(200).json(transformNotification);

    }catch(error){
        res.status(500).json(undefined);
        return next(new Error(error));
    }
}

//? Invoked when the user click "CLEAR ALL" at the frontend
exports.removeAllNotification = async(req, res, next) => {
    try{;
        const { user_id } = req.body;
        //? Remove the user from `recipients` of a specific `notification`
        const result = await NotificationService.removeAllNotification(user_id);
        res.status(200).json(result.acknowledged);

    }catch(error){
        res.status(500).json(false);
        return next(error);
    }
}

exports.createNotification = async(model_value, model_type, notification_type) => {

    try{
        const notification = await transformToNotificationModel(model_value, model_type, notification_type);
        const result = await NotificationService.create(notification);
        //? Send real-time notification to relevant user
        for(const recipient of result.recipients) sendNotification(result, recipient.user_id);
        return true;
    }catch(error){
        throw error;
    }
}

//? Get desired structure of a notification document
async function transformToNotificationModel(model_value, model_type, notification){
    //* 1. Declare what message should be displayed when the user receive & open the notification
    let message = '';
    //* 2. Declare who should receive the notification
    let recipient_list = [];
    //* 3. To get the list of "MANAGER" to send notification if necessary
    const getManagersAndAddToRecipients = async(user_id) => {
        const managers = await UserService.getManagers();
        //? Either "client_id" / "selectedLeaderID"
        recipient_list.push(user_id);
        for (const manager of managers) recipient_list.push(manager._id);
    };

    switch(notification){
        //? Task assignment to the engineers
        case notification_type.task_assigned:
            message = 'You\'ve been assigned a task';
            recipient_list.push(model_value.selectedLeaderID);
            if(model_value.selectedEngineersID && model_value.selectedEngineersID.length > 0) recipient_list = recipient_list.concat(model_value.selectedEngineersID);
            break;
        //? A manager create project for a client
        case notification_type.project_created:
            message = `You have a new project created: ${model_value.name}`;
            recipient_list.push(model_value.client_id);
            break;
        //? A client create ticket for a task (send to PIC && Manager)
        case notification_type.ticket_created:
            message = `There\'s an issue ticket for a task`;
            await getManagersAndAddToRecipients(model_value.selectedLeaderID);
            break;
        //? When a project is completed, send notification to Manager && respective client
        case notification_type.project_completed:
            message = "A project has been completed";
            await getManagersAndAddToRecipients(model_value.client_id);
            break;
        //? When a ticket is solved, send notification to Manager && respective client
        case notification_type.ticket_solved:
            message = "An issue ticket is solved";
            await getManagersAndAddToRecipients(model_value.client_id);
            break;
        //? When a ticket is reopened, send notification to Manager && respective client
        case notification_type.ticket_reopened:
            message = "An issue ticket is reopened to solve";
            await getManagersAndAddToRecipients(model_value.client_id);
            break;
        case notification_type.ticket_due_date:
            message = `Your issue ticket has been set a due date`;
            recipient_list.push(model_value.client_id);
            break;
        default: null;
    }

    //* 3. Generate a notification model based on its 'Schema'
    const notification_doc = {
        model_type: model_type,
        model_id: model_value._id,
        notification_type: notification,
        message: message,
        recipients: recipient_list.map(recipient => ({
            user_id: recipient,
            isRead: false
        }))
    };

    return notification_doc;
}