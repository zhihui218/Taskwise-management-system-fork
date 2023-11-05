const UserService = require("../services/user.service");
const TicketService = require("../services/ticket.service");

//? Transform the `notification` model to the desired format to be receive at frontend (NotificationGetDTO)
exports.notificationTransform = (notification, user_id) => {
    const recipient = notification._doc.recipients.filter(recipient => recipient.user_id == user_id);
    const formatNotification = {
        _id: notification._doc._id,
        model_type: notification._doc.model_type,
        model_id: notification._doc.model_id,
        notification_type: notification._doc.notification_type,
        message: notification._doc.message,
        recipients: recipient[0],
        timestamp: notification._doc.timestamp
    }
    return formatNotification;
}

exports.transformUnreadChat = async(sender_id, ticket_id, unreadCounts) => {
    try{
        const user = await UserService.getUserById(sender_id);
        const ticket = await TicketService.getTicketById(ticket_id);
        const transformUnreadChat = {
            sender_id: user._id,
            sender_name: user.name || undefined,
            sender_profile: user.profile || undefined,
            ticket_id: ticket._id,
            ticket_name: ticket.name,
            unreadCount: unreadCounts
        }

        return transformUnreadChat;
    }catch(error){ throw error; }
}

//? The KPI has maximum value of contribution to the 100%
exports.transformToFixedDouble = (value, maxOfValue) => {
    if(maxOfValue && (value > maxOfValue || !value)) return maxOfValue;
    else if(value == undefined || value == null) return null; 
    else if (value <= 0) return 0; 
    else return parseFloat(value.toFixed(2));
}

exports.getWorkingHourPerMonth = (year, month) => {
    //* 1. Get the number of days in the month of current year (o = Jan, 1 = Feb, ..., 11 = Dec)
    const daysInMonth = new Date(year, month, 0).getDate();
    //* 2. Initialize variables to keep track of total working hours
    let totalWorkingHours = 0;

    //* 3. Loop through each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        //* 3.1 Check if the day is a weekday (Monday to Friday) [0 = Sunday, 1 = Monday, ..., 5 = Friday]
        const dayOfWeek = date.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) totalWorkingHours += 8; // Assuming 8 working hours per day
    }
    return totalWorkingHours;
}