// All the API urls
//todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
const router = require('express').Router();
const DashboardController = require('../controllers/dashboard.controller');

router.get('/pieAnalysis/:model_type', DashboardController.getProjectDash);
router.get('/taskAnalysis', DashboardController.getTaskDash);
router.get('/countAll', DashboardController.countOverall);
router.get('/countClientAndEngineer', DashboardController.countClientAndEngineer);
router.get('/paginateUser/:user_role', DashboardController.paginateClientAndEngineer);
router.get('/getAll/:model_type', DashboardController.getReportProject);
router.get('/workload/:_id', DashboardController.getWeeklyWorkload);

module.exports = router;