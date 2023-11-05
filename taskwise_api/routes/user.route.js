// All the API urls
//todo: Express Router => Define the endpoint of each HTTP method and the controller to handle the request-response
const router = require('express').Router();
const userController = require('../controllers/user.controller');
const upload = require('../utils/multer');
const middleware = require('../utils/middleware');
const { isAuthorized } = require('../utils/middleware');

//For Angular
router.post('/register', [isAuthorized, userController.register]);
//* When an user send request to "/login" endpoint, userController.login is used to handle its request-response
router.post('/login', userController.login);
router.get('/info/:id', [isAuthorized, userController.getInfo]);
// To retrieve the "profile" in FormData using "multer"
router.put('/update/:id', [isAuthorized, upload.single('file'), userController.updateUser]);
// To update engineer's details (performance prediction) by "MANAGER"
router.put('/updateEngineer/:id', [isAuthorized, userController.updateEngineer]);
// To get users with roles === "ENGINEER"
router.get('/getEngineers', [isAuthorized, userController.getEngineers]);
// To get users with roles === "CLIENT"
router.get('/getClients', [isAuthorized, userController.getClients]);
// To get "ENGINEER" / "CLIENT" by "_id"
router.get('/getUser/:_id', [isAuthorized, userController.getUserById]);
router.get('/remarkAndKpi/:id', [isAuthorized, userController.getRemarksAndKPI]);
//? Password Reset API
router.post('/forgot-password', userController.sendResetLink);
router.get('/verify-reset-link/:token', middleware.checkResetPasswordLinkActive, userController.verifyResetLink);
router.post('/reset-password/:token', middleware.checkResetPasswordLinkActive, userController.resetPassword)



// module.exports = router;


//Legacy for FLutter

// router.post('/register', userController.register);
// //* When an user send request to "/login" endpoint, userController.login is used to handle its request-response
// router.post('/login', userController.login);
// router.get('/info/:id', [isAuthorized, userController.getInfo]);
// router.get('/status/:_id', [isAuthorized, userController.checkUserStatus]);
// // To retrieve the "profile" in FormData using "multer"
// router.put('/update/:id', upload.single('file'), userController.updateUser);
// // To get users with roles === "ENGINEER"
// router.get('/getEngineers', userController.getEngineers);
// // To get users with roles === "CLIENT"
// router.get('/getClients', userController.getClients);
// // To get "ENGINEER" / "CLIENT" by "_id"
// router.get('/getUser/:_id', userController.getUserById);
// router.get('/remarkAndKpi/:id', userController.getRemarksAndKPI);
// //? Password Reset API
// router.post('/forgot-password', userController.sendResetLink);
// router.get('/verify-reset-link/:token', middleware.checkResetPasswordLinkActive, userController.verifyResetLink);
// router.post('/reset-password/:token', middleware.checkResetPasswordLinkActive, userController.resetPassword)



module.exports = router;