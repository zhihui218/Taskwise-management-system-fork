// Specifically for "Dashboard" analysis in the frontend
const { type, roles, status, ticket_status } = require('../constants');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');
const ProjectModel = require("../models/Project.model");
const TaskModel = require("../models/Task.model");
const TicketModel = require("../models/Ticket.model");
const UserModel = require("../models/User.model");


class DashboardService{

    //? Count the total number of "Pending", "On Hold / Reopened", and "Completed / Solved" project / task / ticket
    static async countTotal() {
        try{

            const pipeline = [
                {
                    $group:{
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]

            const projectResult = await ProjectModel.aggregate(pipeline);

            const taskResult = await TaskModel.aggregate(pipeline);
            
            const ticketResult = await TicketModel.aggregate(pipeline);

            return { projectResult, taskResult, ticketResult };
        }catch(error){
            throw error;
        }
    }

    //? Count the total number of "Clients" && "Engineers"
    static async countClientAndEngineer() {
        try{

            const pipeline = 
            [
                {
                    $match: {
                        role: { $in: [roles.engineer, roles.client] }
                    }
                },
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1}
                    }
                }
            ]

            return await UserModel.aggregate(pipeline);

        }catch(error){
            throw error;
        }
    }

    static async countDocsNum(user_role) {

        try{
            
            return await UserModel.countDocuments({ role: user_role });

        }catch(error){
            throw error;
        }
    }

    //? Get pagination of "Client" && "Engineer"
    static async paginateClientAndEngineer(user_role, numberOfDocs, startIndex) {
        try{

            return await UserModel.find({ role: user_role }).select('name email profile phone company_name role joining_date').limit(numberOfDocs).skip(startIndex);

        }catch(error){
            throw error;
        }
    }

    //? Retrieve "THIS YEAR" projects / tickets / tasks
    static async getByYear(model_type, cond) {
        try{

            const currentYear = new Date().getFullYear();
    
            const pipeline = [
                {
                    // 1. Filter to get "THIS YEAR" task only
                    $match: {
                        $and:[
                            cond,
                            {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $in: ["$status", [status.pending, status.onHold, ticket_status.reopened]] },
                                                { $eq: [{ $year: "$due_date" }, currentYear] }
                                            ]
                                        },
                                        {
                                            $and: [
                                                { $in: ["$status", [status.completed, ticket_status.solved]] },
                                                { $eq: [{ $year: "$completed_date" }, currentYear] }
                                            ]
                                        }
                                    ]
            
                                }
                            }
                        ]
                    }
                },
                {
                    // 2. Transform the "docs" to desired structures (e.g. include / exclude / create / rename properties of a doc)
                    $project: {
                        //* 1.1 Include the month of "due_date" Date object ( [1, 12] )
                        // month: { $month: '$due_date' },
                        month: {
                            $cond: {
                                if: { $in: ["$status", [status.pending, status.onHold, ticket_status.reopened]] },
                                then: { $month: "$due_date" },
                                else: { $month: "$completed_date" }
                            }
                        },
                        //* 1.2 Include the "status" field of a "Task"
                        status: 1,
                    }
                },
                {
                    // 3. Group the "docs" based on the "month" && "status" for next pipeline
                    $group: {
                        _id: { month: '$month', status: '$status' },
                        //* 2.1 count the total of each "docs" in each group
                        count: { $sum: 1 },
                    },
                },
                {
                    // 4. Further group the previous result by "month"
                    $group: {
                        _id: '$_id.month',
                        //* 3.1 For counts of each "status", store them in the array, "statuses"
                        statuses: {
                            $push: { status: '$_id.status', count: '$count' },
                        },
                    },
                },
            ]
    
            const result = model_type == type.project ? await ProjectModel.aggregate(pipeline) : model_type == type.task ? await TaskModel.aggregate(pipeline) : await TicketModel.aggregate(pipeline);
            
            return result;
    
        }catch(error){
    
            throw error;
    
        }
    }

    //* If now is "August 2024", get the tasks of "August 2024" 
    static async getByMonth(model_type, cond) {
        //? Note: "+1" because "getMonth()" of "Date" object => [ 0, 11 ] 
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        //? "Completed" && "Solved" required "completed_date" instead of "due_date"
        const filterCond = 
        {
            $cond: {
                if: { $in: ["$status", [status.completed, ticket_status.solved]] },
                then: '$completed_date',
                else: '$due_date' ,
            },
        }
        
        try{

            const pipeline = [
                // 1. Filter out the desired documents
                {
                    $match: {
                        $and: [
                            cond,
                            {
                                //? $expr: useful in "$match" to compare values in same document
                                $expr: {
                                    //* 1.1 Get "This Year" && "This Month" task
                                    $and: [
                                        // { $eq: [ { $month: '$due_date' }, currentMonth ] },
                                        // { $eq: [ { $year: '$due_date' }, currentYear ] },
                                        { $eq: [ { $month: filterCond }, currentMonth ] },
                                        { $eq: [ { $year: filterCond }, currentYear ] }
                                    ],
                                },
                            }
                        ]
                },
                },
                // 2. Transform the filtered "Task" documents into necessary structure
                {
                    $project: {
                        //* 2.1 Get the "day" of its "due_date" => [ 1, 31 ]
                        day: { $dayOfMonth: filterCond },
                        //* 2.2 Get its "status"
                        status: 1,
                    },
                },
                {
                    // 2. Group the "docs" based on the "day" && "status" for next pipeline
                    $group: {
                        _id: { day: '$day', status: '$status' },
                        //* 2.1 count the total of each "docs" in each group
                        count: { $sum: 1 },
                    },
                },
                // 3. Further group the previous result by "day"
                {
                    $group: {
                        _id: '$_id.day',
                        //* 3.1 For counts of each "status", store them in the array, "statuses"
                        statuses: {
                            $push: { status: '$_id.status', count: '$count' },
                        },
                    },
                },
            ]

            const result = model_type == type.project ? await ProjectModel.aggregate(pipeline) : model_type == type.task ? await TaskModel.aggregate(pipeline) : await TicketModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    //? Get the "THIS WEEK" projects / tickets / tasks
    static async getByWeek(model_type, cond) {
        const today = new Date();
        const startDay = startOfWeek(today, { weekStartsOn: 1 });
        const endDay = endOfWeek(today, { weekStartsOn: 1 });
        //? "Completed" && "Solved" => "completed_date", "Pending", "Reopened", "On Hold" => "due_date"
        const filterCond = {
            $cond: {
                if: { $in: ['$status', [status.completed, ticket_status.solved] ] },
                then: '$completed_date',
                else: '$due_date'
            }
        }
        
        try{

            const pipeline = [
                // 1. Filter out the desired documents
                {
                    $match: {
                        $and: [
                            cond,
                            {
                                $expr:{
                                    $and: [
                                        { $gte: [filterCond, startDay] },
                                        { $lte: [filterCond, endDay] }
                                    ]
                                }
                            }
                        ], 
                    },
                },
                // 2. Transform the filtered "Task" documents into necessary structure
                {
                    $project: {
                        //* 2.1 Get the "day" of its "due_date" => $dayOfWeek == [ 1(SUNDAY), 7(SATURDAY) ]
                        day: { 
                            $cond: {
                                //* 2.1.1 As a result, we make the array as [ 1(MONDAY), 7(SUNDAY)]
                                if: { $eq: [{ $dayOfWeek: filterCond }, 1] },
                                then: 7,
                                else: { $subtract: [{ $dayOfWeek: filterCond }, 1] }
                            }
                        },
                        //* 2.2 Get its "status"
                        status: 1,
                    },
                },
                {
                    // 2. Group the "docs" based on the "day" && "status" for next pipeline
                    $group: {
                        _id: { day: '$day', status: '$status' },
                        //* 2.1 count the total of each "docs" in each group
                        count: { $sum: 1 },
                    },
                },
                // 3. Further group the previous result by "day"
                {
                    $group: {
                        _id: '$_id.day',
                        //* 3.1 For counts of each "status", store them in the array, "statuses"
                        statuses: {
                            $push: { status: '$_id.status', count: '$count' },
                        },
                    },
                },
            ]

            const result = model_type == type.project ? await ProjectModel.aggregate(pipeline) : model_type == type.task ? await TaskModel.aggregate(pipeline) : await TicketModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    //? Get all "This Month" projects / tasks / tickets to generate "MONTHLY REPORT"
    static async getAll(model_type) {

        try{
            //? Note: "+1" because "getMonth()" of "Date" object => [ 0, 11 ] 
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            //? "Completed" && "Solved" required "completed_date" instead of "due_date"
            const filterCond = 
            {
                $cond: {
                    if: { $in: ["$status", [status.completed, ticket_status.solved]] },
                    then: '$completed_date',
                    //? For "Ticket", we should display it as well even it doesn't have a `due_date`
                    else: { $ifNull: ['$due_date', '$created_date'] },
                },
            }

            const pipeline = [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $eq: [ { $month: filterCond }, currentMonth ] },
                                { $eq: [ { $year: filterCond }, currentYear ] },
                            ]
                        }
                    }
                },
            ]

            //? Selectively push the "$project" of different model
            switch(model_type){
                case type.project:
                    pipeline.push
                    (
                        {
                            $project: {
                                name: 1,
                                status: 1,
                                due_date: 1,
                                priority: 1,
                                // selectedLeaderID: 1,
                                completed_date: 1      
                            }
                        },
                        {
                            $sort: { due_date: 1 }
                        }
                    )
                    break;
                case type.task:
                    pipeline.push
                    (
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                                status: 1,
                                priority: 1,
                                due_date: 1,
                                selectedLeaderID: 1,
                                selectedEngineersID: 1,
                                completed_date: 1  
                            }
                        },
                        {
                            $sort: { due_date: 1 }
                        }
                    )
                    break;
                default:
                    pipeline.push
                    (
                        {
                            $project: {
                                _id: 0,
                                client_id: 1,
                                name: 1,
                                status: 1,
                                priority: 1,
                                created_date: 1,
                                due_date: 1,
                                selectedLeaderID: 1,
                                completed_date: 1  
                            }
                        },
                        {
                            $sort: { created_date: 1 }
                        }
                    )
            }

            return model_type == type.project ? await ProjectModel.aggregate(pipeline) : model_type == type.task ? await TaskModel.aggregate(pipeline) : await TicketModel.aggregate(pipeline);

        }catch(error){
            throw error;
        }
    }
}

module.exports = DashboardService;