const router = require('express').Router();
const upload = require('../utils/multer');
const attachmentController = require('../controllers/attachment.controller');

router.post('/upload', attachmentController.uploadAttachment);

router.get('/getAttachment', attachmentController.getProjectAttachment);

router.get('/getTaskAttachment', attachmentController.getTaskAttachment);

router.delete('/deleteAttachment', attachmentController.deleteAttachments);

router.delete('/deleteTaskAttachment/:taskId', attachmentController.deleteAttachmentsByTasks)

router.delete('/deleteProjectAttachment/:projectId', attachmentController.deleteAttachmentsByProjects)

/**                                  Latest                                */

//* Use of Cloudinary & multer to store files
router.post('/uploadFile', upload.array('files'), attachmentController.uploadFile);

router.get('/getFile/:_id', attachmentController.getFile);

router.delete('/deleteFile/:_id', attachmentController.deleteFile);

module.exports = router;