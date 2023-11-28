// Handle requests from user && send response to user
const taskService = require('../services/task.service');
const middleware = require('../utils/middleware');
const FileController = require('../utils/file.controller');
const NotificationController = require('../controllers/notification.controller');
const { type, notification_type, roles } = require('../constants');
// ADD THIS LINE
const Decorator = require("../utils/decorator");

exports.createTask = async(req, res, next) => {
    try {
        // Retrieve the files uploaded
        const files = req.files;

        const task = req.body;
        
        // Create the task so that we can retrieve its "_id"
        const createdTask = await taskService.createTask(task);

        await uploadFiles(files, createdTask._id);

        //? Push Notification
        await NotificationController.createNotification(createdTask, type.task, notification_type.task_assigned);

        // For middleware, "updateEngineerWorkload" to update related engineer's workload
        req.http_option = "POST";
        req.task = createdTask;
        // For middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = true;
        req.project_id = createdTask.projectID;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(500).json(false);

        return next(new Error(error));
    }
}

exports.getAllTask = async(req, res, next) => {

    try {

        const tasks = await taskService.getAllTasks();

        res.status(200).json({
            status: true,
            tasks: tasks,
        })

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(new Error(error));
    }
}

// ADD DECORATORS
exports.paginateTask = async(req, res, next) => {

    try{
        //* Pagination
        const { page, limit, startIndex, endIndex } = paginationDetails(req);
        let numOfDocs; let taskPaginate;

        switch(req.user.role){
            case roles.manager: {
                numOfDocs = await taskService.countTaskNum();
                taskPaginate = await taskService.paginateAllTasks(limit, startIndex);
                break;
            }
            case roles.engineer: {
                numOfDocs = await taskService.countEngTaskNum(req.user._id);
                taskPaginate = await taskService.paginateEngTasks(req.user._id, limit, startIndex);
                break;
            }
            default: throw new Error("Invalid user or roles");
        }

        //? Decorate the results with necessary behaviors (E.g., number of ticket for each task)
        for(let i = 0; i < taskPaginate.length; i++){
            let decorated = taskPaginate[i].toJSON();
            decorated = await Decorator.numOfTaskTicket(decorated);
            taskPaginate[i] = decorated;
        }

        res.status(200).json(
            {
                numOfDocs: numOfDocs,
                docs: taskPaginate,
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

// ADD DECORATORS
exports.paginateProjectTask = async(req, res, next) => {

    try{
        //* Pagination
        const { page, limit, startIndex, endIndex } = paginationDetails(req);
        const project_id = req.params.project_id;
        
        const numOfDocs = await taskService.countProjectTasks(project_id);
        let taskPaginate = await taskService.paginateProjectTasks(project_id, limit, startIndex)

        // //? Decorate the results with necessary behaviors (E.g., number of ticket for each task)
        for(let i = 0; i < taskPaginate.length; i++){
            let decorated = taskPaginate[i].toJSON();
            decorated = await Decorator.leaderAndEngineers(decorated);
            taskPaginate[i] = decorated;
        }

        res.status(200).json(
            {
                numOfDocs: numOfDocs,
                docs: taskPaginate,
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

exports.getTaskByProject = async(req, res, next) => {

    try {

        const projectId = req.params.projectId;

        const taskList = await taskService.getTaskByProject(projectId);

        res.status(200).json({
            status: true,
            tasks: taskList,
        })

    } catch (error) {

        res.status(500).json({
            status: false,
            tasks: undefined,
        })

        return next(new Error(error));
    }
}

exports.getTaskByWeek = async(req, res, next) => {

    try {
        // Should in the format of "YYYY-MM--DD"
        const targetDate = req.query.date;

        const tasks = await taskService.getTaskByWeek(targetDate);

        res.status(200).json({
            status: true,
            task: tasks,
        });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(new Error(error));
    }
}

// ADD DECORATORS
exports.getTaskById = async(req, res, next) => {

    try {
        const taskId = req.params.id;

        const task = await taskService.getTaskById(taskId);

        if(task){
            //? Decorate the existing task with any necessary behaviors
            let decorated = task.toJSON();
            decorated = await Decorator.taskProject(decorated);
            decorated = await Decorator.leaderAndEngineers(decorated);

            req.task = decorated;
            next();
        }
        else{ res.status(404).json(undefined); }

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(new Error(error));
    }
}

// ADD DECORATORS
exports.updateTask = async(req, res, next) => {

    try {

        const taskID = req.params.id;

        //? For updating workload time of engineer
        const task = await taskService.getTaskById(taskID);

        // Retrieve the files uploaded
        const files = req.files;

        const updatedTask = req.body;

        //* Latest task without "Attachment" updated
        const latest = await taskService.updateTask(taskID, updatedTask);

        //* Latest task with "Attachment" updated (Possibly "null" because attachment is OPTIONAL)
        const result = await uploadFiles(files, taskID);

        //? Decorate the task with necessary details
        let decorator = result ? result.toJSON() : latest.toJSON();
        decorator = await Decorator.taskProject(decorator);
        decorator = await Decorator.leaderAndEngineers(decorator);

        //? For middleware, "updateEngineerWorkload"
        req.http_option = "PUT";
        req.task = task
        req.latest = latest;
        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = decorator;
        req.project_id = latest.projectID;

        // Call to next middleware
        next();


    } catch (error) {

        res.status(500).json({
            status: false,
            task: undefined
        })

        return next(error);
    }
}

exports.updateTaskStatus = async(req, res, next) => {
    try {

        const taskId = req.params.id;

        const status = req.body['status'];

        const result = await taskService.updateTaskStatus(taskId, status);

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = result;
        req.project_id = result.projectID;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(500).json(undefined);

        return next(error);
    }
}

exports.deleteTaskAttachment = async(req, res, next) => {

    try {

        const taskID = req.params.id;

        const attachments = req.body;

        // 3. Delete the "AttachmentSchema" object stored within the project
        const task = await deleteAttachments(taskID, attachments);

        res.status(200).json(task.attachments);

    } catch (error) {

        res.status(500).json(undefined);

        return next(error);
    }
}

exports.deleteTask = async(req, res, next) => {

    try {

        const taskId = req.params.taskId;

        const task = await taskService.getTaskById(taskId);

        //* 1. Delete all its associated attachments in `cloudinary`
        await deleteAttachments(taskId, task.attachments);

        //* 2. The folder to be deleted MUST BE "EMPTY"
        await FileController.deleteFolder(type.task, taskId);

        //* 3. Delete all the relevant notification of the task
        await NotificationController.deleteNotificationByModelId(taskId);

        const deletedTask = await taskService.deleteTask(taskId);

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = true;
        req.project_id = deletedTask.projectID;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(400).json(false)

        return next(error);
    }
}

/** Needed By Project Module */
exports.countProjectTask = async(req, res, next) => {
    
    try{

        const project_id = req.params.project_id;

        const result = await taskService.countProjectTask(project_id);

        res.status(200).json(result);
        
    }catch(error){

        res.status(400).json(undefined);

        return next(error);

    }
}

exports.updateEngineerList = async(req, res, next) => {

    try{
        const project_id = req.params.project_id;

        //* From the "Project" object
        const engineerIDList = req.body;

        await taskService.updateEngineerList(project_id, engineerIDList);

        res.status(200).json(true);

    }catch(error){

        res.status(500).json(false);

        return next(new Error(error));
    }
}

exports.deleteTaskByProject = async(req, res, next) => {

    try {

        // 1. Get the `_id` of deleted project
        const projectId = req.params.project_id;

        // 2. Retrieve all the "Task" docs which is related to the deleted project
        const taskList = await taskService.getTaskToDelete(projectId);

        if(taskList.length > 0 ){
            // 3. For each "Task" doc, delete its files in `Cloudinary` (Reason: Folder can be deleted ONLY if it's empty)
            for(const task of taskList) 
            {
                await FileController.deleteFiles(task.attachments);

                // 4. Once all the `attachments` are deleted, remove the folder for the "Task" doc in `Cloudinary`
                await FileController.deleteFolder(type.task, task._id);

                // 5. Delete all the relevant notification of the task
                await NotificationController.deleteNotificationByModelId(task._id);
            }

            // 5. Finally, delete the ALL "Task" docs related to the project
            const result = await taskService.deleteProjectTask(projectId);
        }

        res.status(200).json(true);

    } catch (error) {

        res.status(400).json(false);

        return next(error);
    }
}

exports.getProjectProgress = async(req, res, next) => {

    try{
        //* 1. Retrieve the target "_id" of a "Project"
        const project_id = req.params.project_id;

        //* 2. Calculate and return the tasks where "projectID == project_id" && "status == Completed / On Hold / Pending"
        const result = await taskService.countProjectProgress(project_id);
        
        res.status(200).json(result)

    }catch(error){
        
        res.status(500).json(undefined);
        return next(error);
    }
}

const paginationDetails = (req) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1)* limit;
    const endIndex = page * limit;
    return{ page, limit, startIndex, endIndex };
}

//* Called only when a file is uploaded
const uploadFiles = async(files, task_id) => {
    if(files && files.length > 0){
        // Upload the files of the task to "cloudinary"
        const uploadFiles = await FileController.uploadFile(files, type.task, task_id);
        // Put the necessary information of the files uploaded in the "task" document
        return await taskService.updateTaskAttachment(task_id, uploadFiles);
    }
    return undefined;
}

const deleteAttachments = async(task_id, attachments) => {
    // 1. Delete all the chosen files of a project
    await FileController.deleteFiles(attachments);

    // 2. Generate another array which stores a list of "cloudinary_id" for chosen files
    const cloudinaryList = attachments.map((attachment) => attachment.cloudinary_id);

    // 3. Delete the "AttachmentSchema" object stored within the project
    const task = await taskService.deleteTaskAttachment(task_id, cloudinaryList);
    return task;
}