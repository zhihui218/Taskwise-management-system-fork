// CRUD of "Project" to MongoDB
const ProjectModel = require("../models/Project.model");
const ObjectId = require('mongoose').Types.ObjectId;
const startOfWeek = require('date-fns/startOfWeek');
const endOfWeek = require('date-fns/endOfWeek');
const { status, roles } = require('../constants')

class ProjectService {

    // Create a project => .create() will invoke the save() directly once the creation is done
    static async createProject(project) {
        try {

            // return await ProjectModel.create(project)

            return await ProjectModel.create({
                client_id: project.client_id,
                name: project.name,
                type: project.type,
                due_date: project.due_date,
                status: project.status,
                priority: project.priority,
                description: project.description,
                // selectedLeaderID: project.selectedLeaderID,
                // selectedEngineersID: project.selectedEngineersID,
            })
        } catch (error) {
            throw error;
        }
    }

    static async getAllProjects() {

        try {

            return await ProjectModel.find({}).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    static async countDocsNum(user_id, user_role) {

        try{
            if(user_id){
                //* For "CLIENT"
                if(user_role == roles.client ) return await ProjectModel.countDocuments({ client_id: user_id})

                //* For "ENGINEER" to see his / her assigned Project
                if(user_role == roles.engineer) return await ProjectModel.countDocuments({ $or: [{ selectedEngineersID: user_id }, {selectedLeaderID: user_id}]});
            }
            else{ return await ProjectModel.countDocuments(); }

        }catch(error){
            throw error;
        }
    }

    //* Pagination features for "PROJECT" Model
    static async paginateProjects(user_id, user_role, numberOfDocs, startIndex){
        try{

            if(user_id) {
                //* Get first `numberOfDocs` of "Project" docs after skipping the first `startIndex` of docs (Arranged in descending of "created_date")
                if(user_role == roles.client) return await ProjectModel.find({ client_id: user_id }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);

                if(user_role == roles.engineer) return await ProjectModel.find({ $or: [{ selectedEngineersID: user_id }, { selectedLeaderID: user_id }] }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);            
            }
            else{ return await ProjectModel.find({}).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex); }

        }catch(error){
            throw error;
        }
    }

    //* For "Manager" to view "CLIENT" projects
    static async countClientDocsNum(user_id) {

        try{
            return await ProjectModel.countDocuments({ client_id: user_id})
        }catch(error){
            throw error;
        }
    }

    //* Pagination features for "PROJECT" Model ("MANAGER" -> "CLIENT")
    static async paginateClientProjects(user_id, numberOfDocs, startIndex){
        try{
            return await ProjectModel.find({ client_id: user_id }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);
        }catch(error){
            throw error;
        }
    }

    static async updateProjectAttachment(project_id, attachmentList){

        return await ProjectModel.findByIdAndUpdate
        (
            project_id,
            //* Instead of "REPLACING", "PUSH" the file uploaded into the "attachments"
            //* For "each" element in `attachmentList`, push it into `attachments`(created if X exist)
            { $push: { attachments: { $each: attachmentList } } }, 
            { new: true }
        )
    }

    //* Delete "AttachmentSchema" object inside a project
    static async deleteProjectAttachment(project_id, cloudinaryList){

        return await ProjectModel.findByIdAndUpdate
        (
            project_id,
            // For each object in `attachment`, if its `cloudinary_id` is inside `cloudinaryList`, remove it
            { $pull: { attachments: { cloudinary_id: { $in: cloudinaryList } } } },
            // Return the latest updated project
            { new: true }
        )
    }

    //* Designed for updating the project's status ONLY
    static async updateProjectStatus(projectID, updatedStatus){
        try{

            const updatedData = { status: updatedStatus };

            if(updatedData.status == status.completed) updatedData.completed_date = new Date();
            else updatedData.$unset = { "completed_date": "" };

            return await ProjectModel.findByIdAndUpdate(projectID, updatedData, { new: true });
        
        } catch(error){
            throw error;
        }
    }

    static async updateProject(projectID, updatedProject) {

        try {

            // const updatedInfo = {
            //     client_id: updatedProject.client_id,
            //     name: updatedProject.name,
            //     type: updatedProject.type,
            //     due_date: updatedProject.due_date,
            //     status: updatedProject.status,
            //     priority: updatedProject.priority,
            //     description: updatedProject.description,
            //     selectedLeaderID: updatedProject.selectedLeaderID,
            //     // If the selectedEngineersID is empty, means the project has no engineers
            //     selectedEngineersID: updatedProject.selectedEngineersID || [],
            // };

            if(updatedProject.status == status.completed) updatedProject.completed_date = new Date();
            else updatedProject.$unset = { "completed_date": "" };

            // { new: true } => returns the modified project instead of the original one
            return await ProjectModel.findByIdAndUpdate(projectID, updatedProject, { new: true });

        } catch (error) {
            throw error;
        }
    }

    static async deleteProject(projectID) {

        try {

            return await ProjectModel.findByIdAndDelete(projectID);

        } catch (error) {
            throw error;
        }
    }

    // Retrieve all the projects where due_date is within the specific "date"
    static async getProjectByWeek(targetDate) {

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
            return await ProjectModel.find(queryFilter).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    static async getProjectsForTaskSelection() {

        try {

            return await ProjectModel.find({}).select('_id name');

        } catch (error) {
            throw error;
        }
    }

    static async getProjectById(projectID) {

        try {

            return ProjectModel.findById(projectID);

        } catch (error) {
            throw error;
        }
    }

    //* Get necessary information of a project for a SPECIFIC task
    static async getProjectOfTask(projectId) {

        try {

            const filter = { _id: projectId };

            // Specify the field of project we need
            const project = { name: 1, client_id: 1, selectedLeaderID: 1, selectedEngineersID: 1 }

            return await ProjectModel.findOne(filter, project);

        } catch (error) {
            throw error;
        }
    }

    //* Get "ALL" projects of a specific "CLIENT"
    static async getProjectsOfClient(client_id) {

        try {

            const filter = { client_id: client_id };

            // Specify the field of project we need
            const project = { _id: 1, name: 1 }

            return await ProjectModel.find(filter, project);

        } catch (error) {
            throw error;
        }
    }

    // Get all the details of a project
    static async getProjectById(projectId) {

        try {
            
            const filter = { _id: projectId };

            return await ProjectModel.findOne(filter);

        } catch (error) {
            throw error;
        }
    }

    //* Needed By Ticket Module
    static async getProjectNameAndLeader(projectId) {

        try {
            
            const filter = { _id: projectId };

            return await ProjectModel.findOne(filter, { _id: 0, name: 1 });

        } catch (error) {
            throw error;
        }
    }

    static async getProjectEngineer(project_id){

        try{

            return await ProjectModel.findById(project_id, { _id: 0, selectedLeaderID: 1, selectedEngineersID: 1 })
        }catch(error){
            throw error;
        }
    }

    //! Required by "Project Status" analysis in dashboard
    static async countProjectByYear() {
        try{

            const currentYear = new Date().getFullYear();

            const pipeline = [
                {
                    // 1. Filter to get "THIS YEAR" project only
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

            const result = await ProjectModel.aggregate(pipeline);

            return result;
            
        }catch(error){
            throw error;
        }
    }

    static async countProjectByCurrentWeek() {
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

            const result = await ProjectModel.aggregate(pipeline);
            
            return result;

        }catch(error){

            throw error;

        }
    }

    //? Remarks and KPI calculation
    // static async getProjectPercent(engineer_id, startDate, endDate){
    //     try{
    //         console.log(startDate.toDate())
    //         console.log(endDate.toDate())
    //         // engineer_id = new mongoose.Types.ObjectId(engineer_id);
    //         const pipeline = [
    //             {
    //                 $match: {
    //                     $or: [
    //                         { selectedEngineersID: new ObjectId(engineer_id) },
    //                         { selectedLeaderID: new ObjectId(engineer_id) }
    //                     ],
    //                     due_date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    //                 }
    //             },
    //             // {
    //             //     $group: {
    //             //     _id: null,
    //             //     totalProjects: { $sum: 1 },
    //             //     completedProjects: {
    //             //         $sum: {
    //             //             $cond: [
    //             //                 {
    //             //                     $and: [
    //             //                         { $eq: ["$status", status.completed] },
    //             //                         { $gte: ["$completed_date", startDate] },
    //             //                         { $lte: ["$completed_date", endDate] }
    //             //                     ]
    //             //                 }, 1, 0]
    //             //         }
    //             //     }
    //             // }
    //             // }
    //             ];
                
    //             const result = await ProjectModel.aggregate(pipeline);
    //             console.log(result);
                
    //             const totalProjects = result[0]?.totalProjects || 0;
    //             console.log(totalProjects);
    //             const completedProjects = result[0]?.completedProjects || 0;

    //             return { totalProjects, completedProjects };
                
                
    //     }catch(error){

    //         throw error;
    //     }
    // }
}

module.exports = ProjectService;