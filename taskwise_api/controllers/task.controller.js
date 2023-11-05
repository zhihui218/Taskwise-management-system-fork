// Handle requests from user && send response to user
const taskService = require('../services/task.service');
const middleware = require('../utils/middleware');
const FileController = require('../utils/file.controller');
const NotificationController = require('../controllers/notification.controller');
const { type, status, notification_type } = require('../constants');
const { endOfMonth } = require('date-fns');

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

exports.paginateTask = async(req, res, next) => {

    try{
        //* Pagination
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;

        //* Check the user roles from the `jwtToken`
        const user_role = req.role;
        //* Check whether a user id / project id is provided is provided
        const _id = req.params._id;
        
        const numOfDocs = await taskService.countDocsNum(_id, user_role);

        const taskPaginate = await taskService.paginateTask(_id, user_role, limit, startIndex);

        req.paginated = {
            numOfDocs: numOfDocs,
            docs: taskPaginate,
            nextPage: endIndex < numOfDocs ? page + 1 : undefined,
            previousPage: startIndex > 0 ? page - 1 : undefined,
            limit: limit
        }

        //? Count the number of tickets for each task
        next();

        // res.status(200).json(
        //     {
        //         numOfDocs: numOfDocs,
        //         docs: taskPaginate,
        //         nextPage: endIndex < numOfDocs ? page + 1 : undefined,
        //         previousPage: startIndex > 0 ? page - 1 : undefined,
        //         limit: limit
        //     }
        // )

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

exports.getTaskById = async(req, res, next) => {

    try {
        // Should in the format of "YYYY-MM--DD"
        const taskId = req.params.id;

        const task = await taskService.getTaskById(taskId);
        
        req.task = task;

        next();

        // res.status(200).json({
        //     status: true,
        //     task: task,
        // });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(new Error(error));
    }
}

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

        // //? Check & Update for the `currentWorkingHour` of each engineer
        // const engineerListOfOldTask = listOfEngineer(task);
        // const engineerListOfLatestTask = listOfEngineer(latest);
        // const selectedList = engineerListOfLatestTask.filter(_id => { !engineerListOfOldTask.includes(_id) });
        // const removedList = engineerListOfOldTask.filter(_id => { !engineerListOfLatestTask.includes(_id) });
        // await middleware.updateEngineerWorkload(selectedList, removedList, latest.estimatedCompletedHour);

        //? Update the assignee of each ticket if the "Main Contact Person" of the task has changed
        await middleware.updateTicketAssignee(task, latest);

        //* Latest task with "Attachment" updated (Possibly "null" because attachment is OPTIONAL)
        const result = await uploadFiles(files, taskID);

        //? For middleware, "updateEngineerWorkload"
        req.http_option = "PUT";
        req.task = task
        req.latest = latest;
        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = result ? result : latest;
        req.project_id = latest.projectID;

        // Call to next middleware
        next();

        // res.status(200).json({
        //     status: true,
        //     task: result ? result : latest
        // });

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

        // 1. Delete all the chosen files of a project
        await FileController.deleteFiles(attachments);

        // 2. Generate another array which stores a list of "cloudinary_id" for chosen files
        const cloudinaryList = attachments.map((attachment) => attachment.cloudinary_id);

        // 3. Delete the "AttachmentSchema" object stored within the project
        const task = await taskService.deleteTaskAttachment(taskID, cloudinaryList);


        res.status(200).json({
            status: true,
            task: task
        });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

exports.deleteTask = async(req, res, next) => {

    try {

        const taskId = req.params.taskId;

        //* The folder to be deleted MUST BE "EMPTY"
        await FileController.deleteFolder(type.task, taskId)

        const deletedTask = await taskService.deleteTask(taskId);

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = true;
        req.project_id = deletedTask.projectID;

        // Call to next middleware
        next();

        // res.status(200).json(true)

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
                // await FileController.deleteFiles(task.attachments);

                // 4. Once all the `attachments` are deleted, remove the folder for the "Task" doc in `Cloudinary`
                // await FileController.deleteFolder(type.task, task._id);
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

//! Required by "Dashboard" analysis at the frontend
exports.getTaskDash = async(req, res, next) => {

    try{
        // 1. Get all the tasks "GROUP BY" 'Month' from MongoDB
        const result = await taskService.getTaskByMonth();
        // 2. Sort all the results based on month (Jan - Dec)
        const sortByMonth = transformTasksByMonth(result);

        // 3. Get all the tasks "GROUP BY" "THIS MONTH" && "THIS YEAR"
        const tasksInCurrentMonth = await taskService.getTaskByCurrentMonth();
        // 4. Sort the results of "CURRENT MONTH" based on day (1 - last day of the month);
        const sortByCurrentMonth = transformTasksByCurrentMonth(tasksInCurrentMonth);

        // 3. Get all the tasks "GROUP BY" "THIS WEEK"
        const tasksInCurrentWeek = await taskService.getTaskByCurrentWeek();
        // 4. Sort the results of "CURRENT WEEK" based on day
        const sortByCurrentWeek = transformTasksByCurrentWeek(tasksInCurrentWeek);

        // 5. Send the expected result back to the frontend
        res.status(200).json({
            yearResult: sortByMonth,
            currentMonthResult: sortByCurrentMonth,
            currentWeekResult: sortByCurrentWeek
        });


    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
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

//? Combine the `selectedLeaderID` && `selectedEngineersID` to update their `currentWorkloadHour`
const listOfEngineer = (task) => {
    return task.selectedEngineersID ? [task.selectedLeaderID, ...task.selectedEngineersID] : [task.selectedLeaderID];
}

//* For each month (January - index[0] to December - index[11]) in the current year, record its "Pending", "On Hold" and "Completed" task
const transformTasksByMonth = (monthGrouping) => {
    // 1. Initialize the different "status" of task as an array (Each index == "MONTH" of year)
    const pendingTask = new Array(12).fill(0); 
    const onHoldTask = new Array(12).fill(0); 
    const completedTask = new Array(12).fill(0);

    return calculateTasks(monthGrouping, pendingTask, onHoldTask, completedTask, 0);
}

//* For each task of the day in "THIS MONTH", we will calculate the "Pending", "On Hold", and "Completed" task for each day
const transformTasksByCurrentMonth = (currentMonthGrouping) => {
    // 1. Get the total number of "days" of current month
    const end = endOfMonth(new Date()).getDate();
    // 1. Initialize the different "status" of task as an array (Each index == "DAY" of month) [E.g., Day 1 == index[0]]
    const pendingTask = new Array(end).fill(0); 
    const onHoldTask = new Array(end).fill(0); 
    const completedTask = new Array(end).fill(0);

    return calculateTasks(currentMonthGrouping, pendingTask, onHoldTask, completedTask, 0);
}

//* For each task of the day in "THIS WEEK", we will calculate the "Pending", "On Hold", and "Completed" task for each day
const transformTasksByCurrentWeek = (currentWeekGrouping) => {
    // 1. Initialize the different "status" of task as an array (Each index == "DAY" of week) [E.g., Day 1 == index[0]]
    const pendingTask = new Array(7).fill(0); 
    const onHoldTask = new Array(7).fill(0); 
    const completedTask = new Array(7).fill(0);

    return calculateTasks(currentWeekGrouping, pendingTask, onHoldTask, completedTask, 0);
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
const calculateTasks = (arrayToCount, pendingList, onHoldList, completedList, total) => {
    // 2. Loop through each month / day
    arrayToCount.forEach(item => {
        // 3. Count the "Pending", "On Hold", and "Completed" tasks for each month ("_id" => "Month" of year => [ 1, 12 ])
        item.statuses.forEach(element => {
            switch(element.status){
                case status.pending: pendingList[item._id - 1] = element.count; total += element.count; break;
                case status.onHold: onHoldList[item._id - 1] = element.count; total += element.count; break;
                case status.completed: completedList[item._id - 1] = element.count; total += element.count; break;
                default: null;
            }
        }
        );
    }
    );
    return {
        [status.pending]: pendingList,
        [status.onHold]: onHoldList,
        [status.completed]: completedList,
        Total: total
    }
}