// CRUD of "Project" to MongoDB
const TaskModel = require("../models/Task.model");
const { startOfWeek, endOfWeek, addDays, setMinutes, setHours } = require('date-fns');
const mongoose = require('mongoose');
const { status, roles } = require('../constants');

class TaskService {

    // Create a project => .create() will invoke the save() directly once the creation is done
    static async createTask(task) {
        try {

            return await TaskModel.create(task);

            // return await TaskModel.create({
            //     name: task.name,
            //     due_date: task.due_date,
            //     status: task.status,
            //     priority: task.priority,
            //     description: task.description,
            //     projectID: task.projectID,
            //     selectedEngineersID: task.selectedEngineersID,
            // })
        } catch (error) {
            throw error;
        }
    }

    static async updateTaskAttachment(task_id, attachmentList){

        return await TaskModel.findByIdAndUpdate
        (
            task_id,
            //* Instead of "REPLACING", "PUSH" the file uploaded into the "attachments"
            //* For "each" element in `attachmentList`, push it into `attachments`(created if X exist)
            { $push: { attachments: { $each: attachmentList } } }, 
            { new: true }
        )
    }

    //* Delete "AttachmentSchema" object inside a project
    static async deleteTaskAttachment(task_id, cloudinaryList){

        return await TaskModel.findByIdAndUpdate
        (
            task_id,
            // For each object in `attachment`, if its `cloudinary_id` is inside `cloudinaryList`, remove it
            { $pull: { attachments: { cloudinary_id: { $in: cloudinaryList } } } },
            // Return the latest updated task
            { new: true }
        )
    }

    static async countDocsNum(_id, user_role) {

        try{
            if(user_role && user_role == roles.engineer){
                // if(user_role == roles.client) return await TaskModel.find({ projectID: _id }).limit(numberOfDocs).sort({ due_date: 1}).skip(startIndex);
                // if(user_role == roles.engineer) return await TaskModel.find({ selectedEngineersID: _id }).limit(numberOfDocs).sort({ due_date: 1 }).skip(startIndex);
                return await TaskModel.countDocuments( { $or: [ {selectedEngineersID: _id}, {selectedLeaderID: _id}] });
            }
            else if(_id) return await TaskModel.countDocuments({ projectID: _id });
            else return await TaskModel.countDocuments();
            // if(_id){
            //     //* For "CLIENT", we let him/her to see the tasks of each project respectively
            //     if(user_role == roles.client ) return await TaskModel.countDocuments({ projectID: _id })

            //     //* For "ENGINEER" to see his / her assigned Task
            //     if(user_role == roles.engineer) return await TaskModel.countDocuments({ selectedEngineersID: _id})
            // }
            //* There's case when the "ENGINEER" should only see his / her own tasks
            // if(user_id) return await TaskModel.countDocuments({ selectedEngineersID: user_id})
            

        }catch(error){
            throw error;
        }
    }

    //* Pagination features for "TASK" Model
    static async paginateTask(_id, user_role, numberOfDocs, startIndex){
        try{

            //* Retrieve tasks of the user when (user.role == "ENGINEER")
            if(user_role && user_role == roles.engineer){
                // if(user_role == roles.client) return await TaskModel.find({ projectID: _id }).limit(numberOfDocs).sort({ due_date: 1}).skip(startIndex);
                // if(user_role == roles.engineer) return await TaskModel.find({ selectedEngineersID: _id }).limit(numberOfDocs).sort({ due_date: 1 }).skip(startIndex);
                return await TaskModel.find( { $or: [{ selectedLeaderID: _id}, { selectedEngineersID: _id }] }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);
            }
            else if(_id) return await TaskModel.find({ projectID: _id }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);
            else{ return await TaskModel.find({}).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex); }
            
        }catch(error){
            throw error;
        }
    }

    static async updateTask(taskID, updatedTask) {

        try {

            // const updatedInfo = {
            //     name: updatedTask.name,
            //     projectID: updatedTask.projectID,
            //     due_date: updatedTask.due_date,
            //     status: updatedTask.status,
            //     priority: updatedTask.priority,
            //     description: updatedTask.description,
            //     selectedEngineersID: updatedTask.selectedEngineersID,
            // };

            // Update the "completed_date" field based on the task's status
            if(updatedTask.status == status.completed) updatedTask.completed_date = new Date();
            else updatedTask.$unset = { "completed_date" : "" };

            // { new: true } => returns the modified project instead of the original one
            return await TaskModel.findByIdAndUpdate(taskID, updatedTask, { new: true }); 

        } catch (error) {
            throw error;
        }
    }

    //* Designed for updating the task's status ONLY
    static async updateTaskStatus(taskID, updateStatus){
        try{

            let updatedData = { status: updateStatus };

            // Update the "completed_date" field based on the task's status
            if(updateStatus == status.completed) updatedData.completed_date = new Date();
            else updatedData.$unset = { "completed_date" : "" };

            return await TaskModel.findByIdAndUpdate(taskID, updatedData, { new: true });
        
        } catch(error){
            throw error;
        }
    }

    static async deleteTask(taskID) {

        try {

            return await TaskModel.findByIdAndDelete(taskID);

        } catch (error) {
            throw error;
        }
    }

    // static async getNameAndLeader(task_id) {
    //     try{
    //         return await TaskModel.findById(task_id, { name: 1, selectedLeaderID: 1 })
    //     }catch(error){
    //         throw error;
    //     }
    // }

    static async getAllTasks() {

        try {

            return await TaskModel.find({}).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    // Retrieve all the projects where due_date is within the specific "date"
    static async getTaskByWeek(targetDate) {

        try {

            const currentDate = new Date(targetDate);

            const start = startOfWeek(currentDate, { weekStartsOn: 1 });

            const end = endOfWeek(currentDate, { weekStartsOn: 1 });

            const queryFilter = {
                due_date: {
                    $gte: start,
                    $lte: end,
                }
            };

            // Sort the projects in ascending order based on "due_date"
            return await TaskModel.find(queryFilter).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    static async getTaskById(taskID) {

        try {

            return TaskModel.findById(taskID);

        } catch (error) {
            throw error;
        }
    }

    //? Not Sure `Flutter` is using
    static async deleteTaskByProject(projectId) {

        try {

            const deletedTasks = await TaskModel.find({ projectID: projectId });

            const deletedTaskIds = deletedTasks.map((task) => task._id);

            const result = await TaskModel.deleteMany({
                projectID: projectId
            });

            return { 'result': result, 'taskIDs': deletedTaskIds };

        } catch (error) {
            throw error;
        }
    }

    /** Needed By Project Module */
    //* Count the total number of task of a "project"
    static async countProjectTask(project_id){

        try{

            const pipeline = [
                {
                    $match: { projectID: new mongoose.Types.ObjectId(project_id) }
                },
                {
                    $group:{
                        _id: "$projectID",
                        numOfTasks: { $sum: 1},
                        numOfCompletedTasks: {
                            $sum: { $cond: [ { $eq: ["$status", status.completed]}, 1, 0 ]}
                        }
                    }
                }
            ]

            const result = await TaskModel.aggregate(pipeline);

            if(result.length == 1) return result[0];

            else return { numOfTasks: 0, numOfCompletedTasks: 0};
            
        }catch(error){
            
            throw error;
        }
    }

    //* Display task list of a specific project
    static async getTaskByProject(projectId) {

        try {

            const filter = { projectID: projectId };

            // Specify the field of task we need
            const projectedTask = {
                _id: 1,
                name: 1,
                due_date: 1,
                status: 1,
                priority: 1,
                description: 1,
                selectedEngineersID: 1
            }

            return await TaskModel.find(filter, projectedTask).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    //* Retrieve the task list of a deleted project
    static async getTaskToDelete(project_id) {

        try {

            const filter = { projectID: project_id };

            // Specify the field of task we need
            const projectedTask = {
                _id: 1,
                attachments: 1,
            }

            return await TaskModel.find(filter, projectedTask);

        } catch (error) {
            throw error;
        }
    }

    //* When the project's `selectedLeaderID` || `selectedEngineersID` is changed, check and remove the removed "ENGINEER" as well
    static async updateEngineerList(project_id, selectedEngineersList){

        try{

            await TaskModel.updateMany
            (
                { projectID: project_id },
                { $pull: { selectedEngineersID: { $nin: selectedEngineersList }}}
            )
            
        }catch(error){
            throw error;
        }
    }

    //? Get the weekly completed task of each engineer for manager to review
    static async getWeeklyCompletedOfEngineer(engineer_id){
        try{
            const currentDate = new Date();
            const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
            const sunday = endOfWeek(currentDate, { weekStartsOn: 1 });
            //* 1. Get all the completed tasks in this week
            const tasks = await TaskModel.find({ 
                $or: [{ selectedLeaderID: engineer_id }, { selectedEngineersID: engineer_id }],
                completed_date: { $gte: monday, $lte: sunday },
            })
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            //* 2. Find the total sum of workload hours per day 
            const workloadPerDay = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
            tasks.forEach((task) => {
                const dayOfWeek = task.completed_date.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
                const dayName = days[dayOfWeek];
                workloadPerDay[dayName] += task.estimatedCompletedHour;
            });

            return workloadPerDay;

        }catch(error){ throw error; }
    }

    //* Delete all the tasks related to a deleted project
    static async deleteProjectTask(projectId) {

        try {

            const result = await TaskModel.deleteMany({ projectID: projectId });

            return result;

        } catch (error) {
            throw error;
        }
    }

    //* Check how many "Completed" task of a project (Aggregation pipeline => Processes done at database - More efficient)
    static async countProjectProgress(project_id){
        try {

            //* Aggregation Pipeline Syntax
            const pipeline = [
                {
                    //* 1. Find the "Task" documents with matching "project_id"
                    $match: { projectID: new mongoose.Types.ObjectId(project_id) }
                },
                {
                    //* 2. Group the "Task" documents together by "project_id"
                    $group: {
                        _id: "$projectID",
                        //* 3. Calculate the total number of tasks with specified "project_id" (Result 1)
                        totalCounts: { $sum: 1 },
                        //* 4. From the matching tasks, calculate where its "status" == "Pending" (Result 2)
                        numOfPending: {
                            $sum: {
                                //? $cond: [ <expression>, <value-if-true>, <value-if-false>]
                                $cond: [ { $eq: ["$status", status.pending] }, 1, 0 ]
                            }
                        },
                        //* 5. From the matching tasks, calculate where its "status" == "On Hold" (Result 2)
                        numOfOnHold: {
                            $sum: { $cond: [ { $eq: ["$status", status.onHold] }, 1, 0 ] }
                        },
                        //* 6. From the matching tasks, calculate where its "status" == "Completed" (Result 2)
                        numOfCompleted: {
                            $sum: { $cond: [ { $eq: ["$status", status.completed] }, 1, 0 ] }
                        }
                    }
                }
            ];

            const result = await TaskModel.aggregate(pipeline);
    
            // The result will be an array, but since we're matching by project_id, it should have only one element.
            if (result.length === 1) return result[0];

            // Return default values / throw an error if needed
            else return undefined;

        } catch (error) {

            throw error;
        }
    }

    //! Required by "Dashboard" analysis at the frontend (group by month)
    static async getTaskByMonth() {
        try{

            const currentYear = new Date().getFullYear();

            const pipeline = [
                {
                    // 1. Filter to get "THIS YEAR" task only
                    $match: {
                        $expr: {
                            $eq: [{ $year: '$due_date' }, currentYear]
                        }
                    }
                },
                {
                    // 2. Transform the "docs" to desired structures (e.g. include / exclude / create / rename properties of a doc)
                    $project: {
                        //* 1.1 Include the month of "due_date" Date object ( [1, 12] )
                        month: { $month: '$due_date'},
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

            const result = await TaskModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    //* If now is "August 2024", get the tasks of "August 2024" 
    static async getTaskByCurrentMonth() {
        //? Note: "+1" because "getMonth()" of "Date" object => [ 0, 11 ] 
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        try{

            const pipeline = [
                // 1. Filter out the desired documents
                {
                    $match: {
                        //? $expr: useful in "$match" to compare values in same document
                        $expr: {
                            //* 1.1 Get "This Year" && "This Month" task
                            $and: [
                                { $eq: [ { $month: '$due_date' }, currentMonth ] },
                                { $eq: [ { $year: '$due_date' }, currentYear ] },
                            ],
                    },
                },
                },
                // 2. Transform the filtered "Task" documents into necessary structure
                {
                    $project: {
                        //* 2.1 Get the "day" of its "due_date" => [ 1, 31 ]
                        day: { $dayOfMonth: '$due_date' },
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
                // {
                //     $group: {
                //         //* 3.1 Group by "day" && "status"
                //         _id: { day: '$day', status: '$status' },   
                //         //* 3.1 For each group, counts its total
                //         count: { $sum: 1 },
                //     },
                // },
            ]

            const result = await TaskModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    static async getTaskByCurrentWeek() {
        const today = new Date();
        const startDay = startOfWeek(today, { weekStartsOn: 1 });
        const endDay = endOfWeek(today, { weekStartsOn: 1 });
        
        try{

            const pipeline = [
                // 1. Filter out the desired documents
                {
                    $match: {
                        //? $expr: useful in "$match" to compare values in same document
                        due_date: {
                            $gte: startDay,
                            $lte: endDay
                        }
                },
                },
                // 2. Transform the filtered "Task" documents into necessary structure
                {
                    $project: {
                        //* 2.1 Get the "day" of its "due_date" => $dayOfWeek == [ 1(SUNDAY), 7(SATURDAY) ]
                        day: { 
                            $cond: {
                                //* 2.1.1 As a result, we make the array as [ 1(MONDAY), 7(SUNDAY)]
                                if: { $eq: [{ $dayOfWeek: '$due_date' }, 1] },
                                then: 7,
                                else: { $subtract: [{ $dayOfWeek: '$due_date' }, 1] }
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

            const result = await TaskModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    //? Remarks and KPI calculation
    static async getTaskPercent(engineer_id, startDate, endDate){
        try{
            const pipeline = [
                {
                    $match: {
                    selectedEngineersID: engineer_id,
                    due_date: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
                {
                    $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: {
                        $cond: [
                            {
                            $and: [
                                { $eq: ["$status", status.completed] },
                                { $gte: ["$completed_date", startOfMonth] },
                                { $lte: ["$completed_date", endOfMonth] }
                            ]
                            },
                            1,
                            0
                        ]
                        }
                    }
                    }
                }
                ];
                
                const result = await TaskModel.aggregate(pipeline).exec();
                
                const totalTasks = result[0]?.totalTasks || 0;
                const completedTasks = result[0]?.completedTasks || 0;
                
        }catch(error){

            throw error;
        }
    }

}

module.exports = TaskService;