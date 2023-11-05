// Notification for each user
export interface NotificationGetDTO {
    _id: string,
    model_type: string,
    model_id: string,
    notification_type: string,
    message: string,
    timestamp: string,
    recipients: { user_id: string, isRead: boolean; }
}