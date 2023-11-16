const jwt = require("jsonwebtoken");
const { status, ticket_status, maxWorkHourPerWeek, notification_type, type } = require('../constants');
const TicketModel = require('../models/Ticket.model');
const TaskModel = require('../models/Task.model');
const ProjectModel = require('../models/Project.model');
const UserModel = require('../models/User.model');
const TaskService = require('../services/task.service');
const TicketService = require('../services/ticket.service');
const UserService = require('../services/user.service');
const NotificationController = require('../controllers/notification.controller');
const moment = require('moment');
const { transformUnreadChat, getWorkingHourPerMonth, transformToFixedDouble } = require("../utils/helper");
// Access environment variables
require('dotenv').config()


// MIDDLEWARE
exports.isAuthorized = (req, res, next) => {
    // Header names in Express are auto-converted to 'lowercase' (from `HttpInterceptors` of frontend)
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    // Remove Bearer from string
    token = token.replace(/^Bearer\s+/, "");

    if (token) {
        jwt.verify(token, 'secretKey', (err, decoded) => 
        {
            if (err) {
                // Unauthorized access is blocked and returned to the frontend
                return res.status(401).json({ message: "Unauthorized Access Found" });
            }
            // The token is valid and safe (Append the `user role` through this middleware)
            req.user = decoded.user;
            //? next() => Move on to the next middleware to process the request
            next();
        });
    } 
    else {
        return res.status(401).json({ message: "Session Expired. Please Login Again." });
    }
}

exports.checkResetPasswordLinkActive = async(req, res, next) => {
    try{
        const jwtToken = req.params.token;

        if(jwtToken){
            jwt.verify(jwtToken, process.env.RESET_PASSWORD_KEY, (err, decoded) =>
            {
                if(err){ res.status(400).json('Password reset link has expired. Please apply for the new one!') }
                else{
                    req.decoded_result = decoded;
                    req.canResetPassword = true;
                    next();
                }
            })
        }else{ res.status(400).json('Unauthorized user cannot reset password'); }
    }catch(error){ res.status(400).json("Oops! Something went wrong. Please try again.") }
}

//? Check the role of authorized user
exports.checkRole = (req, res, next) => {

    try{
        const role = req.user.role;

        //* Retrieve the `role` of the user only
        req.role = role;
        next();
    }catch(error){
        return res.status(500).json(undefined);
    }
}

//? Retrieve all the engineers that are doing the current project(tasks of the project)
exports.getProjectEngineer = async(req, res, next) => {
    try{
        const project = req.project;
        //? Retrieve the engineer list by checking each task of the project
        const selectedEngineerList = [];
        const task_list = await TaskModel.find({ projectID: project._id }, { selectedLeaderID: 1, selectedEngineersID: 1});

        //? Retrieve the personal details of each engineer
        for(const task of task_list){
            await checkEngineerExist(selectedEngineerList, task.selectedLeaderID);
            for(const engineer_id of task.selectedEngineersID) await checkEngineerExist(selectedEngineerList, engineer_id);
        }

        project._doc.selectedEngineer = selectedEngineerList;
        res.status(200).json({ project: project._doc });
    }catch(error){
        res.status(500).json(undefined);
        return next(new Error(error));
    }
}

exports.updateEngineerWorkload = async(req, res, next) => {
    try{
        //? Either "POST" || "PUT"
        const http_option = req.http_option;

        if(http_option == "POST"){
            // Whenever a new task is created, simply add the `estimatedCompletedHour` to `currentWorkingHour` of all engineers involved
            const task = req.task;
            //* 1. Retrieve the list of engineers of the created task
            const selectedEngineersID = task.selectedEngineersID ? [task.selectedLeaderID, ...task.selectedEngineersID] : [task.selectedLeaderID];
            //* 2. Update the `currentWorkingHour` of each of them
            for(const engineer_id of selectedEngineersID){
                const user = await UserModel.findById(engineer_id);
                user.currentWorkingHour = user.currentWorkingHour + task.estimatedCompletedHour >= maxWorkHourPerWeek.BASIC ? maxWorkHourPerWeek.BASIC : user.currentWorkingHour + task.estimatedCompletedHour;
                user.$locals.isUpdateWorkingHour = true;
                await user.save();
            }
        }
        else if(http_option == "PUT"){
            const ori_task = req.task; const latest_task = req.latest;
            const ori_selectedEngineersID = ori_task.selectedEngineersID ? [ori_task.selectedLeaderID, ...ori_task.selectedEngineersID] : [ori_task.selectedLeaderID];
            const latest_selectedEngineersID = latest_task.selectedEngineersID ? [latest_task.selectedLeaderID, ...latest_task.selectedEngineersID] : [latest_task.selectedLeaderID];
            // During the task update, there's possibility that the engineer reassignment happen
            /**
             * In engineer reassignment, there're 3 possible outcomes:
             *  1. Original list of engineer (engineer that's not added / removed)
             *  2. Added list of engineer (engineer that's newly added)
             *  3. Removed list of engineer (engineer that's removed)
             */
            const originalEngineers = ori_selectedEngineersID.filter((_id) => latest_selectedEngineersID.some((engineer_id) => engineer_id.equals(_id)));
            const addedEngineers = latest_selectedEngineersID.filter((_id) => !ori_selectedEngineersID.some((engineer_id) => engineer_id.equals(_id)));
            const removedEngineers = ori_selectedEngineersID.filter((_id) => !latest_selectedEngineersID.some((engineer_id) => engineer_id.equals(_id)));
            // In the task update, there's also possibility that `estimatedCompletedHour` of the task changed 
            /**
             * There's 3 possible outcomes:
             *  1. previous `estimatedCompletedHour` > current `estimatedCompletedHour`
             *  2. previous `estimatedCompletedHour` < current `estimatedCompletedHour`
             *  3. previous `estimatedCompletedHour` == current `estimatedCompletedHour`
             */
            const differenceInHour = ori_task.estimatedCompletedHour - latest_task.estimatedCompletedHour;
            //* 1. For each added engineer, he / she will get the latest `estimatedCompletedHour` of the task
            for(const engineer_id of addedEngineers){
                const user = await UserModel.findById(engineer_id);
                user.currentWorkingHour = user.currentWorkingHour + latest_task.estimatedCompletedHour >= maxWorkHourPerWeek.BASIC ? maxWorkHourPerWeek.BASIC : user.currentWorkingHour + latest_task.estimatedCompletedHour;
                user.$locals.isUpdateWorkingHour = true;
                await user.save();
            }
            //* 2. For each removed engineer, he / she will subtract the difference between `estimatedCompletedHour`
            for(const engineer_id of removedEngineers) {
                if(differenceInHour > 0){
                    const user = await UserModel.findById(engineer_id);
                    user.currentWorkingHour = user.currentWorkingHour - differenceInHour <= 0  ? 0 : user.currentWorkingHour - differenceInHour;
                    user.$locals.isUpdateWorkingHour = true;
                    await user.save();    
                }
            }
            //* 2. For each original engineer, he / she will add the difference between `estimatedCompletedHour`
            for(const engineer_id of originalEngineers) {
                if(differenceInHour < 0){
                    const user = await UserModel.findById(engineer_id);
                    user.currentWorkingHour = user.currentWorkingHour + (-1 * differenceInHour) >= maxWorkHourPerWeek.BASIC ? maxWorkHourPerWeek.BASIC: user.currentWorkingHour + (-1 * differenceInHour);
                    user.$locals.isUpdateWorkingHour = true;
                    await user.save();
                }
            }
        }

        //? Go to the next middleware, "checkProjectCompletion" after updating the engineer's workload
        next();
    }catch(error){
        res.status(500).json(undefined);
        return next(new Error(error));
    }
}

//? Get the sender and ticket details for the "unread" chats
exports.getChatNotificationData = async(req, res, next) => {
    try{
        const unread_list = req.chats;
        let transform_list = [];

        for(let unread_chat of unread_list){
            const chat = await transformUnreadChat(unread_chat._id.sender_id, unread_chat._id.ticket_id, unread_chat.unreadCount);

            transform_list.push(chat);
        }

        res.status(200).json(transform_list);

    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

//? Every time after adding / editing / deleting / updating a ticket, run this middleware to update task's status (if necessary)
exports.checkTaskCompletion = async(req, res, next) => {
    try{
        //? Get the updated result (possible "Task" / "Ticket" OR "true / false from "create" ) && respective `task_id`
        const task_id = req.task_id;
        //* 1 Get the task based on the task_id of the ticket
        const task = await TaskModel.findById(task_id);
        //* 2. Get all tickets which belongs to the specific task
        const tickets = await TicketModel.find({ task_id: task_id }, { _id: 0, status: 1 });

        //* 5. Check whether all its tickets are "Solved"
        const allTicketSolved = tickets.every((ticket) => ticket.status == ticket_status.solved);

        //* 6.1 IF "ALL" tickets are completed solved || there's no any ticket
        if(allTicketSolved || tickets.length == 0){
            task.status = status.completed;
            task.completed_date = new Date();
        }
        else{
            task.status = task.status == status.completed ? status.pending : task.status;
            task.completed_date = undefined;
        }

        //* 7. Save any changes made to the specific project
        await task.save();

        //* 8. IF there's no error, got to the next middleware "checkProjectCompletion"
        next();

    }catch(error){
        res.status(500).json(undefined);
        next(new Error(error));
    }
}

//? Every time after adding / editing / deleting / updating a task, run this middleware to update project's status (if necessary)
exports.checkProjectCompletion = async(req, res, next) => {
    try{
        //? Get the updated result (possible "Task" / "Ticket" / "true / false fro "create" ) && respective `project_id`
        const result = req.result;
        const project_id = req.project_id;
        //* 1 Get the project based on the project_id of the task
        const project = await ProjectModel.findById(project_id);
        //* 2. Get all tasks which belongs to the specific project
        const tasks = await TaskModel.find({ projectID: project_id }, { _id: 0, status: 1 });

        //* 4. Check whether all its tasks are "Completed"
        const allTaskCompleted = tasks.every((task) => task.status == status.completed);

        //* 6.1 IF "ALL" tasks are completed && "ALL" tickets are solved
        //* 6.2 IF "ALL" tasks are completed && there's no any ticket for that project
        //* 6.3 IF "ALL" tickets are solved && there's no any task for that project
        if(allTaskCompleted || tasks.length == 0){
            project.status = status.completed;
            project.completed_date = new Date();
            //? Post Notification
            await NotificationController.createNotification(project, type.project, notification_type.project_completed);
        }
        else{
            project.status = project.status == status.completed ? status.pending : project.status;
            project.completed_date = undefined;
        }

        //* 7. Save any changes made to the specific project
        await project.save();

        //* 8. IF there's no error, pass the updated "Task"  /"Ticket" document back to the user at the frontend
        res.status(200).json(result);

    }catch(error){
        res.status(500).json(undefined);
        return next(new Error(error));
    }
}

exports.getTaskNameAndLeader = async(req, res, next) => {
    try{
        let ticket = req.ticket;
        let paginated = req.paginated;
        //? Get ticket detail in "ticket-details" page
        if(ticket){
            const { name } = await TaskModel.findById(ticket.task_id, { name: 1, _id: 0 });
            const leader = await UserService.getUserById(ticket.selectedLeaderID);
            res.status(200).json( {...ticket._doc, task_name: name, selectedLeader: leader } );
        }
        //? Get ticket details of each ticket in "Pagination"
        else if(paginated){
            for(let i = 0; i < paginated.docs.length; i++){
                const { name } = await TaskModel.findById(paginated.docs[i].task_id, { name: 1, _id: 0 });
                const leader = await UserService.getUserById(paginated.docs[i].selectedLeaderID);
                paginated.docs[i] = { ...paginated.docs[i]._doc, task_name: name, selectedLeader: leader }
            }
            res.status(200).json(paginated);
        }

    }catch(error){
        res.status(500).json(undefined);
    }
}

//? Count the number of issue ticket for each task
exports.countNumOfTicket = async(req, res, next) => {
    try{
        const paginated = req.paginated;
        for(let i = 0; i < paginated.docs.length; i++){
            const numOfTicket = await TicketModel.countDocuments({ task_id: paginated.docs[i]._id })
            paginated.docs[i] = { ...paginated.docs[i]._doc, numOfTicket: numOfTicket }
        }

        res.status(200).json(paginated)
    }catch(error){
        res.status(500).json(undefined);
    }
}

//? Calculate the progress of the task
exports.countTaskProgress = async(req, res, next) => {
    try{
        const task = req.task;
        const ticket_progress = await TicketService.countTaskProgress(task._id);
        //? Calculate the percentage of each status of ticket
        const pendingPercent = parseFloat(((ticket_progress.numOfPending / ticket_progress.totalCounts) * 100).toFixed(1));
        const reopenedPercent = parseFloat(((ticket_progress.numOfReopened / ticket_progress.totalCounts) * 100).toFixed(1));
        const solvedPercent = parseFloat(((ticket_progress.numOfSolved / ticket_progress.totalCounts) * 100).toFixed(1));

        res.status(200).json(
            { 
                ...task._doc, 
                ticket_progress: { totalCounts: ticket_progress.totalCounts, pendingPercent, reopenedPercent, solvedPercent  } 
            });
        
        
    }catch(error){
        res.status(500).json(undefined);
    }
}

// SHARED / MIXING MODEL FUNCTIONS
exports.trackProjectProgress = async(project) => {

    try{
        
        const task_progress = await TaskService.countProjectProgress(project._id);

        const ticket_progress = await TicketService.countProjectProgress(project._id);

        if(task_progress?.totalCounts) project.task_completed_percent = parseFloat(((task_progress.numOfCompleted / task_progress.totalCounts) * 100).toFixed(1));

        if(ticket_progress?.totalCounts) project.ticket_completed_percent = parseFloat(((ticket_progress.numOfSolved / ticket_progress.totalCounts) * 100).toFixed(1));

    }catch(error){
        throw error;
    }
}

exports.getProjectLeader = async(leader_id) => {
    try{
        
        const leader = await UserService.getUserById(leader_id);

        return leader;

    }catch(error){
        throw error;
    }
}

//? Happens when "Main Contact Person" of a task is changed
exports.updateTicketAssignee = async(oldTask, latestTask) => {

    try{
        if(oldTask.selectedLeaderID !== latestTask.selectedLeaderID){
            await TicketModel.updateMany({ task_id: latestTask.task_id }, { selectedLeaderID: latestTask.selectedLeaderID })
        }
    }catch(error){
        throw error;
    }
}

exports.calculateRemarksAndKPI = async(engineer_id) => {

    try{
        // Get the start and end dates of the current month
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');
        const today = moment();
        const dateRange = { $gte: startOfMonth, $lte: endOfMonth };

        //? Task Completion Rate (Current Month)
        const totalTasks = await TaskModel.countDocuments(
            {
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id}],
                due_date: dateRange
            }
        )
        const completedTasks = await TaskModel.countDocuments(
            {
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id}],
                completed_date: dateRange,
                status: status.completed
            }
        )
        const taskCompRate = transformToFixedDouble((completedTasks / totalTasks));

        //? Ticket Resolution Rate
        const totalTickets = await TicketModel.countDocuments(
            {
                selectedLeaderID: engineer_id,
                $or: [{ due_date: dateRange }, {created_date: dateRange }]
            }
        )
        const completedTickets = await TicketModel.countDocuments(
            {
                selectedLeaderID: engineer_id,
                completed_date: dateRange,
                status: ticket_status.solved
            }
        )
        const ticketResRate = transformToFixedDouble((completedTickets / totalTickets));

        //? Weekly Completed Task of The Engineer
        const workloadPerDay = await TaskService.getWeeklyCompletedOfEngineer(engineer_id);

        //? Workload KPI Calculation
        const totalWorkingHours = getWorkingHourPerMonth(new Date().getFullYear(), new Date().getMonth() + 1); //? 1-based month (1 = January)
        const task_list = await TaskModel.find({
            $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id }],
            status: status.completed,
            completed_date: dateRange
        });
        let workload = 0;
        for(const task of task_list) workload += task.estimatedCompletedHour;
        const workloadKPI = transformToFixedDouble(((workload / totalWorkingHours) * 50), 50);

        //? On-Time Task Completion KPI
        const overdueTasks = await TaskModel.countDocuments(
            {
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id }],
                due_date: { $gte: startOfMonth, $lt: today },
                status: { $in: [status.pending, status.onHold] }
            }
        )
        const onTimeTaskKPI = transformToFixedDouble((((totalTasks - overdueTasks) / totalTasks) * 15), 15);

        //? On-Time Ticket Resolution KPI
        const overdueTickets = await TicketModel.countDocuments(
            { 
                selectedLeaderID: engineer_id,
                due_date: { $gte: startOfMonth, $lt: today },
                status: { $in: [ticket_status.pending, ticket_status.reopened] }, 
            });
        const onTimeTicketKPI = transformToFixedDouble((((totalTickets - overdueTickets) / totalTickets) * 15), 15);

        //? Fixed Ticket KPI (The lesser the `REOPENED` ticket, the greater the KPI)
        const reopenedTickets = await TicketModel.countDocuments(
            { 
                selectedLeaderID: engineer_id,
                status: ticket_status.reopened, 
                $or: [{ created_date: dateRange }, { due_date: dateRange }] 
            });
        const fixedTicketKPI = transformToFixedDouble((((totalTasks - reopenedTickets) / totalTasks) * 20), 20);

        //? Early Task Completion Bonus (Count the number of tasks which are completed before due date at month onwards)
        const numOfEarlyTaskCompletion = await TaskModel.countDocuments(
            {
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id }],
                due_date: { $gt: endOfMonth },
                status: status.completed
            }
        )

        //? Late Task Completion Penalize (Count the number of tasks of previous month which are incomplete)
        const numOfLateTask = await TaskModel.countDocuments(
            {
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id }],
                due_date: { $lt: startOfMonth },
                status: { $in: [status.pending, status.onHold] }
            }
        )

        //? Early Ticket Resolution Bonus (Count the number of tickets which are resolved before due date at month onwards)
        const numOfEarlyTicketResolution = await TicketModel.countDocuments(
            {
                selectedLeaderID: engineer_id,
                due_date: { $gt: endOfMonth },
                status: ticket_status.solved
            }
        )

        //? Late Ticket Resolution Penalize (Count the number of tickets of previous month which are unresolved)
        const numOfLateTicket = await TicketModel.countDocuments(
            {
                selectedLeaderID: engineer_id,
                $or: [{ created_date: { $lt: startOfMonth } }, { due_date: { $lt: startOfMonth } }],
                status: { $in: [ticket_status.pending, ticket_status.reopened] }
            }
        )

        const performance_data = {
            workloadObj: workloadPerDay,
            taskCompletionRate: taskCompRate,
            ticketResolutionRate: ticketResRate,
            workloadKPI: workloadKPI,
            onTimeTaskKPI: onTimeTaskKPI,
            onTimeTicketKPI: onTimeTicketKPI,
            fixedTicketKPI: fixedTicketKPI,
            numOfEarlyTaskCompletion: numOfEarlyTaskCompletion,
            numOfEarlyTicketResolution: numOfEarlyTicketResolution,
            numOfLateTask: numOfLateTask,
            numOfLateTicket: numOfLateTicket,
        }

        return performance_data;

    }catch(error){
        throw error;
    }
}

const checkEngineerExist = async (engineerList, engineer_id) => {
    //? Append the engineer to the list only if it doesn't exist before
    if(!engineerList.find(engineer => engineer._id.equals(engineer_id))){
        const engineer = await UserService.getUserById(engineer_id);
        engineerList.push(engineer);
    }
}
