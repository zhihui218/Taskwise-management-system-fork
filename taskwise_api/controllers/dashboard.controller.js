// Specifically for "Dashboard" analysis in the frontend
const { type, status, roles, ticket_status } = require('../constants');
const { endOfMonth } = require('date-fns');
const DashboardService = require('../services/dashboard.service');
const UserService = require('../services/user.service');
const TaskService = require('../services/task.service');
const middleware = require("../utils/middleware");
const ObjectId = require('mongoose').Types.ObjectId;

//? For "First-Card" section at frontend "Dashboard"
exports.countOverall = async(req, res, next) => {

    try{

        const { projectResult, taskResult, ticketResult } = await DashboardService.countTotal();

        const projects = transformOverall(projectResult);
        const tasks = transformOverall(taskResult);
        const tickets = transformOverall(ticketResult);

        res.status(200).json( { projects, tasks, tickets } );

    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}

//? For "Second-Card" section at frontend "Dashboard"
exports.countClientAndEngineer = async(req, res, next) => {

    try{

        const result = await DashboardService.countClientAndEngineer();

        const { numOfClient, numOfEngineer } = transformUserCount(result);

        res.status(200).json( { numOfClient, numOfEngineer } );

    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}

exports.paginateClientAndEngineer = async(req, res, next) => {

    try{

        //* Pagination
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;

        //* Check the user roles from the `jwtToken`
        const user_role = req.params.user_role;

        const numOfDocs = await DashboardService.countDocsNum(user_role);

        const userPaginate = await DashboardService.paginateClientAndEngineer(user_role, limit, startIndex);

        res.status(200).json(
            {
                numOfDocs: numOfDocs,
                docs: userPaginate,
                nextPage: endIndex < numOfDocs ? page + 1 : undefined,
                previousPage: startIndex > 0 ? page - 1 : undefined,
                limit: limit
            }
        )


    }catch(error){

        res.status(500).json(undefined);

        next(new Error(error));
    }
}

//? For "Bar Chart" of "Weekly Workload" of each engineer
exports.getWeeklyWorkload = async(req, res, next) => {
    try{
        const user_id = req.params._id;

        const workloadObj = await TaskService.getWeeklyCompletedOfEngineer(user_id);

        res.status(200).json(workloadObj);
    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}


//? For "Pie Chart" of "Project Status && Ticket Status" at frontend "Dashboard"
exports.getProjectDash = async(req, res, next) => {

    try{
        //? Determine the "ROLE" of the user (Get "ENGINEER" tasks only if the user.role == "ENGINEER")
        const role = req.user.role; const user_id = req.user._id;
        const cond = transformRoleCond(role, user_id);
        
        //? "Project Status" && "Ticket Status" share EXACTLY same chart format
        const model_type = req.params.model_type;
        const status_1 = model_type == type.project ? status.onHold : ticket_status.reopened;
        const status_2 = model_type == type.project ? status.completed : ticket_status.solved;
        // 1. Get all the projects "GROUP BY" 'Month' from MongoDB
        const result = await DashboardService.getByYear(model_type, cond);
        // 2. Calculate the number of "Pending", "On Hold", "Completed" project for "THIS YEAR && THIS MONTH"
        const { yearObj, monthObj } = calculateOverviewOfYearAndMonth(result, status_1, status_2);

        // 3. Get all the tasks "GROUP BY" 'THIS WEEK' from MongoDB
        const result_2 = await DashboardService.getByWeek(model_type, cond);
        // 4. Calculate the number of "Pending", "On Hold", "Completed" project for "THIS WEEK"
        const weekObj = calculateOverviewOfWeek(result_2,  status_1, status_2);

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

//? For "Line Graph" of "Task Distribution" at frontend "Dashboard"
exports.getTaskDash = async(req, res, next) => {

    try{
        //? Determine the "ROLE" of the user (Get "ENGINEER" tasks only if the user.role == "ENGINEER")
        const role = req.user.role; const user_id = req.user._id;
        const cond = transformRoleCond(role, user_id);
        
        // 1. Get all the tasks "GROUP BY" 'Month' from MongoDB
        const result = await DashboardService.getByYear(type.task, cond);
        // 2. Sort all the results based on month (Jan - Dec)
        const sortByMonth = transformByYear(result);

        // 3. Get all the tasks "GROUP BY" "THIS MONTH" && "THIS YEAR"
        const tasksInCurrentMonth = await DashboardService.getByMonth(type.task, cond);
        // 4. Sort the results of "CURRENT MONTH" based on day (1 - last day of the month);
        const sortByCurrentMonth = transformByMonth(tasksInCurrentMonth);

        // 3. Get all the tasks "GROUP BY" "THIS WEEK"
        const tasksInCurrentWeek = await DashboardService.getByWeek(type.task, cond);
        // 4. Sort the results of "CURRENT WEEK" based on day
        const sortByCurrentWeek = transformByWeek(tasksInCurrentWeek);

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

//? For "Monthly Report" project's section at frontend "Dashboard"
exports.getReportProject = async(req, res, next) => {

    try{
        // 1. Check which collection to use
        const model_type = req.params.model_type;

        // 2. Retrieve all necessary information based on the type of collection
        const result = await DashboardService.getAll(model_type);

        switch(model_type){
            // 3.1 IF it's project, retrieve the project's progress
            case type.project:
                for(const project of result){
                    // //* Get the project
                    await middleware.trackProjectProgress(project);
                };
                break;
            // 3.2 IF it's ticket, retrieve the ticket's client
            case type.ticket:
                for(const ticket of result){
                    ticket.selectedLeader = await UserService.getUserById(ticket.selectedLeaderID);
                    ticket.client = await UserService.getUserById(ticket.client_id);
                }
            // 3.2 IF it's task / ticket, retrieve its engineers
            default: 
            for(const task of result){
                task.selectedLeader = await UserService.getUserById(task.selectedLeaderID);
            }
        }

        res.status(200).json(result);

    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}

//? If it's "ENGINEER" / "CLIENT" accessing, we should display their information only in the dashboard
const transformRoleCond = (user_role, user_id) => {
    let cond = {};
    if(user_role){
        if(user_role == roles.engineer){
            cond = {
                $or: [
                    { selectedLeaderID: new ObjectId(user_id)},
                    { selectedEngineersID: { $in: [ new ObjectId(user_id) ]}}
                ]
            }
        }
        else if(user_role == roles.client){
            cond = {
                client_id: new ObjectId(user_id)
            }
        }
    }
    return cond;
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
//? Transform to desired output format
const transformOverall = (groups) => {
    
    const result = { Total: 0 };

    groups.forEach((item) => {
        result[item._id] = item.count;
        result['Total'] += item.count;
    })

    return result;
}

const transformUserCount = (userList) => {
    let numOfClient = 0;
    let numOfEngineer = 0;

    userList.forEach((item) => {
        if(item._id == roles.engineer) numOfEngineer = item.count;
        else if(item._id == roles.client) numOfClient = item.count;
    })

    return { numOfClient, numOfEngineer };
}

//? For each month (January - index[0] to December - index[11]) in the current year, record its "Pending", "On Hold" and "Completed" task
const transformByYear = (monthGrouping) => {
    // 1. Initialize the different "status" of task as an array (Each index == "MONTH" of year)
    const pending = new Array(12).fill(0); 
    const onHold = new Array(12).fill(0); 
    const completed = new Array(12).fill(0);

    return calculateByDetail(monthGrouping, pending, onHold, completed, 0);
}

//? For each task of the day in "THIS MONTH", we will calculate the "Pending", "On Hold", and "Completed" task for each day
const transformByMonth = (currentMonthGrouping) => {
    // 1. Get the total number of "days" of current month
    const end = endOfMonth(new Date()).getDate();
    // 1. Initialize the different "status" of task as an array (Each index == "DAY" of month) [E.g., Day 1 == index[0]]
    const pending = new Array(end).fill(0); 
    const onHold = new Array(end).fill(0); 
    const completed = new Array(end).fill(0);

    return calculateByDetail(currentMonthGrouping, pending, onHold, completed, 0);
}

//? For each task of the day in "THIS WEEK", we will calculate the "Pending", "On Hold", and "Completed" task for each day
const transformByWeek = (currentWeekGrouping) => {
    // 1. Initialize the different "status" of task as an array (Each index == "DAY" of week) [E.g., Day 1 == index[0]]
    const pending = new Array(7).fill(0); 
    const onHold = new Array(7).fill(0); 
    const completed = new Array(7).fill(0);

    return calculateByDetail(currentWeekGrouping, pending, onHold, completed, 0);
}

//? Calculate and store overall "Pending", "On Hold", "Completed" projects / tasks / tickets
const calculateOverviewOfYearAndMonth = (arrayToCount, status_1, status_2) => {
    //? status_1 => "Reopened" / "On Hold"
    //? status_2 => "Solved" / "Completed"
    const yearObj = { 
        [status.pending]: 0,
        [status_1]: 0,
        [status_2]: 0,
        Total: 0
    };

    const monthObj = {
        [status.pending]: 0,
        [status_1]: 0,
        [status_2]: 0,
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
                case status_1: 
                                    yearObj[status_1] += element.count;
                                    yearObj['Total'] += element.count;
                                    if(item._id == currentMonth){
                                        monthObj[status_1] += element.count;
                                        monthObj["Total"] += element.count;
                                    } 
                                    break;
                case status_2: 
                                    yearObj[status_2] += element.count;
                                    yearObj['Total'] += element.count;
                                    if(item._id == currentMonth){
                                        monthObj[status_2] += element.count;
                                        monthObj["Total"] += element.count;
                                    }  
                                    break;
                default: null;    
            }
        })
    })
    return { yearObj, monthObj };
} 

const calculateOverviewOfWeek = (arrayToCount, status_1, status_2) => {
    const weekObj = { 
        [status.pending]: 0,
        [status_1]: 0,
        [status_2]: 0,
        Total: 0
    };

    arrayToCount.forEach(item => {
        item.statuses.forEach(element => {
            switch(element.status){
                case status.pending: weekObj[status.pending] += element.count; weekObj['Total'] += element.count; break;
                case status_1: weekObj[status_1] += element.count; weekObj['Total'] += element.count; break;
                case status_2: weekObj[status_2] += element.count; weekObj['Total'] += element.count; break;
                default: null;    
            }
        })
    })
    return weekObj;
}

//? Calculate and store the "Pending", "On Hold", "Completed" projects / tasks / tickets (DAY BY DAY / MONTH BY MONTH)
const calculateByDetail = (arrayToCount, pendingList, onHoldList, completedList, total) => {
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


