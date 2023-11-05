// All the API urls
//todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
const router = require('express').Router();
const NotificationController = require('../controllers/notification.controller');

//? Get notification of a specific user
router.get('/getNotification/:_id', NotificationController.retrieveNotification);
//? Get number of "UNREAD" notification for a specific user (first time load the notification list)
router.get('/getUnreadNotification/:_id', NotificationController.countUnreadNotification);
//? Delete notification of a user
router.put('/updateNotification/:notification_id', NotificationController.removeUserFromNotification)
//? Delete "ALL" notification of a user
router.put('/removeAllNotification', NotificationController.removeAllNotification)
//? Mark the user's notification as `READ`
router.put('/markAsRead/:notification_id', NotificationController.markAsRead);

module.exports = router;