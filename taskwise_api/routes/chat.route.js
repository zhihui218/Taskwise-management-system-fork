const router = require('express').Router();
const ChatController = require('../controllers/chat.controller');
const middleware = require('../utils/middleware');

router.get('/retrieve/:ticket_id/:user_id', ChatController.retrieveChat);
router.get('/unreadChat/:_id', [ ChatController.retrieveUnreadChat, middleware.getChatNotificationData ]);
router.put('/deleteChat', ChatController.clearChat);
router.put('/readChat', ChatController.markChatAsRead);
router.put('/readAllChat/:_id', ChatController.markAllAsRead);


module.exports = router;