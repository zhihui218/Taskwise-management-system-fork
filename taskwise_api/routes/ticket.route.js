// All the API urls
//todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
const router = require('express').Router();
const TicketController = require('../controllers/ticket.controller');
const upload = require('../utils/multer');
const middleware = require('../utils/middleware');

router.post('/createTicket', upload.array('files'), [ TicketController.createTicket, middleware.checkTaskCompletion, middleware.checkProjectCompletion ]);

router.get('/allTickets',TicketController.getAllTicket);

router.get('/getTicket/:id', TicketController.getTicketById, middleware.getTaskNameAndLeader);

//* Get tickets when user.role == "MANAGER"
router.get('/getTickets', [ TicketController.paginateTicket, middleware.getTaskNameAndLeader ]);
//* Get tickets of a specific "CLIENT || ENGINEER"
router.get('/getTickets/:user_id', [ TicketController.paginateTicket, middleware.getTaskNameAndLeader ]);
//* Get tickets of a specific task / project
router.get('/getTicketsOfTask/:task_id', [ TicketController.paginateTicket, middleware.getTaskNameAndLeader ]);
router.get('/getTicketsOfProject/:project_id', [ TicketController.paginateTicket, middleware.getTaskNameAndLeader ]);

//* Get all the tickets of a specific project
router.get('/getProjectTickets/:projectId', TicketController.getTicketByProject);
router.get('/ticket/getTaskTickets/:taskId', TicketController.getTicketByTask);

router.put('/updateTicket/:id', upload.array('files'), [ TicketController.updateTicket, middleware.checkTaskCompletion, middleware.checkProjectCompletion ]);

router.put('/updateStatus/:id', [ TicketController.updateTicketStatus, middleware.checkTaskCompletion, middleware.checkProjectCompletion ]);

router.put('/updateDueAndEng/:id', TicketController.updateTicketDueAndEng);

//* To delete the "UPLOADED" files of a ticket
router.put('/deleteTicketAttachment/:id', TicketController.deleteTicketAttachment);

router.delete('/delete/:ticketId', [ TicketController.deleteTicket, middleware.checkTaskCompletion, middleware.checkProjectCompletion ]);

/** Needed by "Task" Module */
router.delete('/deleteTaskTicket/:task_id', [ TicketController.deleteTicketByTask, middleware.checkProjectCompletion ]);

/** Needed by "Project" Module */
router.get('/getTicketNum/:project_id', TicketController.countProjectTicket);

router.get('/getProjectProgress/:project_id', TicketController.getProjectProgress);

router.put('/updateEngineer/:project_id', TicketController.updateEngineerList);

router.delete('/deleteProjectTicket/:project_id', TicketController.deleteTicketByProject);

module.exports = router;