// Handle requests from user && send response to user
const projectService = require('../services/project.service');
const FileController = require('../utils/file.controller');
const { type, status, notification_type } = require('../constants');
const NotificationController = require('../controllers/notification.controller');
const middleware = require('../utils/middleware');

exports.createProject = async(req, res, next) => {
    try {
        // Retrieve the files uploaded
        const files = req.files;

        const project = req.body;

        // Create the project so that we can retrieve its "_id"
        const createdProject = await projectService.createProject(project);

        //? Push Notification
        await NotificationController.createNotification(createdProject, type.project, notification_type.project_created);

        await uploadFiles(files, createdProject._id)

        res.status(200).json(true);

    } catch (error) {

        res.status(400).json(false);

        return next(new Error(error));
    }
}

exports.getAllProject = async(req, res, next) => {

    try {

        const projects = await projectService.getAllProjects();

        res.status(200).json({
            status: true,
            projects: projects,
        })

    } catch (error) {

        res.status(400).json({
            status: false,
        })

        return next(new Error(error));
    }
}

exports.getProjectOfTask = async(req, res, next) => {

    try {

        const projectId = req.params.projectId;

        const project = await projectService.getProjectOfTask(projectId);

        res.status(200).json({ project: project })

    } catch (error) {

        res.status(400).json({ project: undefined })

        return next(new Error(error));
    }
}

exports.getProjectsOfClient = async(req, res, next) => {

    try {

        const client_id = req.params.client_id;

        const projects = await projectService.getProjectsOfClient(client_id);

        res.status(200).json({ projects: projects })

    } catch (error) {

        res.status(400).json({ projects: undefined })

        return next(new Error(error));
    }
}


exports.getProjectById = async(req, res, next) => {

    try {

        const projectId = req.params.projectId;

        const project = await projectService.getProjectById(projectId);

        req.project = project;

        //? Go to middleware "getProjectEngineer" => To retrieve list of engineers involved in the project
        next();

        // res.status(200).json({
        //     status: true,
        //     project: project,
        // })

    } catch (error) {

        res.status(500).json(undefined)

        return next(new Error(error));
    }
}

exports.paginateProject = async(req, res, next) => {

    try{
        //* Pagination
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;

        //* Check the user roles from the `jwtToken`
        const user_role = req.role;
        //* Check whether a user_ id is provided
        const user_id = req.params.user_id;
        let numOfDocs; let projectPaginate;
        
        //* Manager, Engineer, Client viewing their relevant project
        if(user_role){
            numOfDocs = await projectService.countDocsNum(user_id, user_role);
            projectPaginate = await projectService.paginateProjects(user_id, user_role, limit, startIndex);
        }
        else{
            //* Manager view client project.
            numOfDocs = await projectService.countClientDocsNum(user_id);
            projectPaginate = await projectService.paginateClientProjects(user_id, limit, startIndex);
        }

        res.status(200).json(
            {
                numOfDocs: numOfDocs,
                docs: projectPaginate,
                nextPage: endIndex < numOfDocs ? page + 1 : undefined,
                previousPage: startIndex > 0 ? page - 1 : undefined,
                limit: limit
            }
        )

    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}

exports.getProjectsForTaskSelection = async(req, res, next) => {

    try {

        const projectList = await projectService.getProjectsForTaskSelection();

        res.status(200).json({ projects: projectList });

    } catch (error) {

        res.status(500).json({ projects: undefined })

        return next(new Error(error));
    }
}

exports.getProjectsByWeek = async(req, res, next) => {

    try {
        // Should in the format of "YYYY-MM--DD"
        const targetDate = req.query.date;

        const projects = await projectService.getProjectByWeek(targetDate);

        res.status(200).json({
            status: true,
            project: projects,
        });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(new Error(error));
    }
}

exports.updateProjectStatus = async(req, res, next) => {
    try {

        const projectId = req.params.id;

        const status = req.body['status'];

        const result = await projectService.updateProjectStatus(projectId, status);

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json(undefined);

        return next(error);
    }
}

exports.updateProject = async(req, res, next) => {

    try {

        const projectID = req.params.id;

        // Retrieve the files uploaded
        const files = req.files;

        const updatedProject = req.body;

        //* Latest project without "Attachment" updated
        const latest = await projectService.updateProject(projectID, updatedProject);

        //* Latest project with "Attachment" updated (Possibly "null" because attachment is OPTIONAL)
        const result = await uploadFiles(files, projectID);

        res.status(200).json({
            status: true,
            project: result ? result : latest
        });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

exports.deleteProjectAttachment = async(req, res, next) => {

    try {

        const projectID = req.params.id;

        const attachments = req.body;

        // 1. Delete all the chosen files of a project
        await FileController.deleteFiles(attachments);

        // 2. Generate another array which stores a list of "cloudinary_id" for chosen files
        const cloudinaryList = attachments.map((attachment) => attachment.cloudinary_id);

        // 3. Delete the "AttachmentSchema" object stored within the project
        const project = await projectService.deleteProjectAttachment(projectID, cloudinaryList);


        res.status(200).json({
            status: true,
            project: project
        });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

exports.deleteProject = async(req, res, next) => {

    try {
        const projectId = req.params.projectId;

        //* The folder to be deleted MUST BE "EMPTY"
        await FileController.deleteFolder(type.project, projectId)

        await projectService.deleteProject(projectId);

        res.status(200).json(true);

    } catch (error) {

        res.status(500).json(false);

        return next(error);
    }
}

//* Needed By Ticket Module
exports.getProjectNameAndLeader = async(req, res, next) => {

    try {

        const project_id = req.params.project_id;

        const project = await projectService.getProjectNameAndLeader(project_id);

        // const leader = await middleware.getProjectLeader(project.selectedLeaderID);

        // res.status(200).json({ name: project.name, leader: leader});
        res.status(200).json({ name: project.name });

    } catch (error) {

        res.status(500).json(undefined);

        return next(new Error(error));
    }
}

exports.getProjectEngineers = async(req, res, next) => {

    try {

        const project_id = req.params.project_id;

        const projectEngineers = await projectService.getProjectEngineer(project_id);

        res.status(200).json(projectEngineers);

    } catch (error) {

        res.status(500).json(undefined);

        return next(new Error(error));
    }
}

//! Required by "Dashboard" analysis at the frontend
exports.getProjectDash = async(req, res, next) => {

    try{
        // 1. Get all the tasks "GROUP BY" 'Month' from MongoDB
        const result = await projectService.countProjectByYear();
        // 2. Calculate the number of "Pending", "On Hold", "Completed" project for "THIS YEAR && THIS MONTH"
        const { yearObj, monthObj } = transformProjectsByMonthAndYear(result);

        // 3. Get all the tasks "GROUP BY" 'THIS WEEK' from MongoDB
        const result_2 = await projectService.countProjectByCurrentWeek();
        // 4. Calculate the number of "Pending", "On Hold", "Completed" project for "THIS WEEK"
        const weekObj = transformProjectsByWeek(result_2);

        // 5. Send the expected result back to the frontend
        res.status(200).json({
            yearResult: yearObj,
            currentMonthResult: monthObj,
            currentWeekResult: weekObj
        });


    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}


//* Called only when a file is uploaded
const uploadFiles = async(files, project_id) => {
    if(files && files.length > 0){
        // Upload the files of the project to "cloudinary"
        const uploadFiles = await FileController.uploadFile(files, type.project, project_id);
        // Put the necessary information of the files uploaded in the "project" document
        return await projectService.updateProjectAttachment(project_id, uploadFiles);
    }
    return undefined;
}

//* Total number of "Pending", "On Hold", and "Completed" projects in "THIS YEAR && THIS MONTH"
const transformProjectsByMonthAndYear = (arrayToCount) => {
    const yearObj = { 
        [status.pending]: 0,
        [status.onHold]: 0,
        [status.completed]: 0,
        Total: 0
    };
    const monthObj = {
        [status.pending]: 0,
        [status.onHold]: 0,
        [status.completed]: 0,
        Total: 0
    }
    
    // 1. Get the current month
    const currentMonth = new Date().getMonth() + 1;
    arrayToCount.forEach(item => {
        item.statuses.forEach(element => {
            switch(element.status){
                case status.pending: 
                                    yearObj[status.pending] += element.count;
                                    yearObj['Total'] += element.count;
                                    if(item._id == currentMonth){
                                        monthObj[status.pending] += element.count;
                                        monthObj["Total"] += element.count;
                                    } 
                                    break;
                case status.onHold: 
                                    yearObj[status.onHold] += element.count;
                                    yearObj['Total'] += element.count;
                                    if(item._id == currentMonth){
                                        monthObj[status.onHold] += element.count;
                                        monthObj["Total"] += element.count;
                                    } 
                                    break;
                case status.completed: 
                                    yearObj[status.completed] += element.count;
                                    yearObj['Total'] += element.count;
                                    if(item._id == currentMonth){
                                        monthObj[status.completed] += element.count;
                                        monthObj["Total"] += element.count;
                                    }  
                                    break;
                default: null;    
            }
        })
    })
    return { yearObj, monthObj };
}

//* Total number of "Pending", "On Hold", and "Completed" projects in "THIS YEAR && THIS MONTH"
const transformProjectsByWeek = (arrayToCount) => {
    const weekObj = { 
        [status.pending]: 0,
        [status.onHold]: 0,
        [status.completed]: 0,
        Total: 0
    };

    arrayToCount.forEach(item => {
        item.statuses.forEach(element => {
            switch(element.status){
                case status.pending: weekObj[status.pending] += element.count; weekObj['Total'] += element.count; break;
                case status.onHold: weekObj[status.onHold] += element.count; weekObj['Total'] += element.count; break;
                case status.completed: weekObj[status.completed] += element.count; weekObj['Total'] += element.count; break;
                default: null;    
            }
        })
    })
    return weekObj;
}

/**
 * 
*       Sample data format:
        [
            {
                "_id": 1,
                "statuses": [
                    {
                        "status": "Pending",
                        "count": 1
                    }
                ]
            },
        ]
 */