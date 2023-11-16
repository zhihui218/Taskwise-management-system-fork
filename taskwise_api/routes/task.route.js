// All the API urls
//todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
const router = require('express').Router();
const taskController = require('../controllers/task.controller');
const middleware = require('../utils/middleware');
const upload = require('../utils/multer');

router.post('/createTask', upload.array('files'), [ taskController.createTask, middleware.updateEngineerWorkload, middleware.checkProjectCompletion ]);

router.put('/updateTask/:id', upload.array('files'), [ taskController.updateTask, middleware.updateEngineerWorkload, middleware.checkProjectCompletion ]);

router.put('/updateStatus/:id', [ taskController.updateTaskStatus, middleware.checkProjectCompletion ]);

//* To delete the "UPLOADED" files of a project
router.put('/deleteTaskAttachment/:id', taskController.deleteTaskAttachment);

router.delete('/delete/:taskId', [ taskController.deleteTask, middleware.checkProjectCompletion ]);

router.get('/allTasks', taskController.getAllTask);

//* Paginate tasks for "Project" page
router.get('/paginate', [ taskController.paginateTask, middleware.countNumOfTicket ]);
//* Get task of a specific "ENGINEER"
router.get('/paginate/:_id', [ taskController.paginateTask, middleware.countNumOfTicket ]);
//For flutter temp
router.get('/paginate/:_id', [ taskController.paginateTask, middleware.countNumOfTicket ]);

//* Get task of a specific project in "Project-Details" page
router.get('/taskOfProjectPaginate/:_id', [ taskController.paginateTask, middleware.countNumOfTicket ]);

//* Get all the tasks of a specific project
router.get('/getProjectTasks/:projectId', taskController.getTaskByProject);

router.get('/getTask/:id', [ taskController.getTaskById, middleware.countTaskProgress ]);

router.get('/getTasksByWeek', taskController.getTaskByWeek);

/** Needed by "Project" Module */
router.get('/getTaskNum/:project_id', taskController.countProjectTask);

router.get('/getProjectProgress/:project_id', taskController.getProjectProgress);

router.put('/updateEngineer/:project_id', taskController.updateEngineerList);

router.delete('/deleteProjectTask/:project_id', taskController.deleteTaskByProject);

//! Required by "Dashboard" analysis at the frontend
router.get('/taskAnalysis', taskController.getTaskDash);

module.exports = router;


//Legacy

// // All the API urls
// //todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
// const router = require('express').Router();
// const taskController = require('../controllers/task.controller');
// const middleware = require('../utils/middleware');
// const upload = require('../utils/multer');

// router.post('/task/createTask', upload.array('files'), [ taskController.createTask, middleware.updateEngineerWorkload, middleware.checkProjectCompletion ]);

// router.put('/task/updateTask/:id', upload.array('files'), [ taskController.updateTask, middleware.updateEngineerWorkload, middleware.checkProjectCompletion ]);

// router.put('/task/updateStatus/:id', [ taskController.updateTaskStatus, middleware.checkProjectCompletion ]);

// //* To delete the "UPLOADED" files of a project
// router.put('/task/deleteTaskAttachment/:id', taskController.deleteTaskAttachment);

// router.delete('/task/delete/:taskId', [ taskController.deleteTask, middleware.checkProjectCompletion ]);

// router.get('/task/allTasks', taskController.getAllTask);

// //* Paginate tasks for "Project" page
// router.get('/paginate', [ middleware.isAuthorized, taskController.paginateTask, middleware.countNumOfTicket ]);
// //* Get task of a specific "ENGINEER"
// router.get('/paginate/:_id', [ middleware.isAuthorized, middleware.checkRole, taskController.paginateTask, middleware.countNumOfTicket ]);
// //* Get task of a specific project in "Project-Details" page
// router.get('/task/taskOfProjectPaginate/:_id', [ middleware.isAuthorized, taskController.paginateTask, middleware.countNumOfTicket ]);

// //* Get all the tasks of a specific project
// router.get('/task/getProjectTasks/:projectId', taskController.getTaskByProject);

// router.get('/task/getTask/:id', [ taskController.getTaskById, middleware.countTaskProgress ]);

// router.get('/task/getTasksByWeek', taskController.getTaskByWeek);

// /** Needed by "Project" Module */
// router.get('/task/getTaskNum/:project_id', taskController.countProjectTask);

// router.get('/task/getProjectProgress/:project_id', taskController.getProjectProgress);

// router.put('/task/updateEngineer/:project_id', taskController.updateEngineerList);

// router.delete('/task/deleteProjectTask/:project_id', taskController.deleteTaskByProject);

// //! Required by "Dashboard" analysis at the frontend
// router.get('/task/taskAnalysis', taskController.getTaskDash);

// module.exports = router;