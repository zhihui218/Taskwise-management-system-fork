const TicketModel = require("../models/Ticket.model");
const mongoose = require('mongoose');
const { ticket_status, roles, type } = require('../constants');

class TicketService{

    static async createTicket(ticket){
        
        try{

            return await TicketModel.create(ticket);

        }catch(error){
            throw error;
        }
    }

    //* Invoked when user.role == "MANAGER" || "ENGINEER"
    static async getAllTickets() {

        try {

            return await TicketModel.find({}).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    static async getTicketById(ticket_id){

        try{
            return await TicketModel.findById(ticket_id);

        }catch(error){
            throw error;
        }
    }

    static async updateTicketAttachment(ticket_id, attachmentList){

        return await TicketModel.findByIdAndUpdate
        (
            ticket_id,
            //* Instead of "REPLACING", "PUSH" the file uploaded into the "attachments"
            //* For "each" element in `attachmentList`, push it into `attachments`(created if X exist)
            { $push: { attachments: { $each: attachmentList } } }, 
            { new: true }
        )
    }

    //* Delete "AttachmentSchema" object inside a project
    static async deleteTicketAttachment(ticket_id, cloudinaryList){

        return await TicketModel.findByIdAndUpdate
        (
            ticket_id,
            // For each object in `attachment`, if its `cloudinary_id` is inside `cloudinaryList`, remove it
            { $pull: { attachments: { cloudinary_id: { $in: cloudinaryList } } } },
            // Return the latest updated task
            { new: true }
        )
    }

    static async countDocsNum(user_id, user_role) {

        try{
            if(user_id){
                //* For "CLIENT"
                if(user_role == roles.client ) return await TicketModel.countDocuments({ client_id: user_id})

                //* For "ENGINEER" to see his / her assigned Ticket
                if(user_role == roles.engineer) return await TicketModel.countDocuments({selectedLeaderID: user_id});
            }
            //* For "MANAGER" view all Tickets
            else{ return await TicketModel.countDocuments() };

        }catch(error){
            throw error;
        }
    }

    static async countDocsNumOfTask(model_type, model_id) {
        try{ 
            const filter = model_type == type.project ? { project_id: model_id } : { task_id: model_id };
            return await TicketModel.countDocuments(filter); 
        }
        catch(error){ throw error;}
    }

    static async paginateTaskTickets(model_type, model_id, numberOfDocs, startIndex){
        try{ 
            const filter = model_type == type.project ? { project_id: model_id } : { task_id: model_id };
            return await TicketModel.find(filter).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex); 
        }
        catch(error){ throw error; }
    }

    //* Pagination features for "TICKET" Model
    static async paginateTickets(user_id, user_role, numberOfDocs, startIndex){

        try{
            if(user_id) {
                //* Get first `numberOfDocs` of "Tickets" docs after skipping the first `startIndex` of docs (Arranged in ascending of "created_date")
                if(user_role == roles.client) return await TicketModel.find({ client_id: user_id }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);

                if(user_role == roles.engineer) return await TicketModel.find({ selectedLeaderID: user_id }).limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex);            
            }
            else{ return await TicketModel.find().limit(numberOfDocs).sort({ created_date: -1 }).skip(startIndex); }
            
        }catch(error){
            throw error;
        }
    }

    static async updateTicket(ticketID, updatedTicket) {

        try {

            if(updatedTicket.status == ticket_status.solved) updatedTicket.completed_date = new Date();
            else updatedTicket.$unset = { "completed_date" : "" };

            // { new: true } => returns the modified ticket instead of the original one before modification
            return await TicketModel.findByIdAndUpdate(ticketID, updatedTicket, { new: true }); 

        } catch (error) {
            throw error;
        }
    }

    //* Designed for updating the task's status ONLY
    static async updateTicketStatus(ticketID, updatedStatus){
        try{

            const updatedData = { status: updatedStatus };

            if(updatedData.status == ticket_status.solved) updatedData.completed_date = new Date();
            else updatedData.$unset = { "completed_date" : "" };

            return await TicketModel.findByIdAndUpdate(ticketID, updatedData, { new: true });
        
        } catch(error){
            throw error;
        }
    }

    //* Designed for updating the task's "due_date" && "selectedEngineersID" ONLY
    static async updateTicketDueAndEng(ticketID, ticket){
        try{

            const properties = {};

            if(ticket.due_date && ticket.due_date != "") properties.due_date = ticket.due_date;
            // if(ticket.selectedEngineersID && ticket.selectedEngineersID.length > 0 ) properties.selectedEngineersID = ticket.selectedEngineersID;
            if(ticket.selectedLeaderID && ticket.selectedLeaderID != "" ) properties.selectedLeaderID = ticket.selectedLeaderID;

            return await TicketModel.findByIdAndUpdate(ticketID, properties, { new: true });
        
        } catch(error){
            throw error;
        }
    }

    static async deleteTicket(ticket_id) {

        try {

            return await TicketModel.findByIdAndDelete(ticket_id);

        } catch (error) {
            throw error;
        }
    }

    /** Needed By Project Module */

    //* Count the total number of ticket of a "project"
    static async countProjectTicket(project_id){

        try{

            const pipeline = [
                {
                    $match: { project_id: new mongoose.Types.ObjectId(project_id) }
                },
                {
                    $group:{
                        _id: "$project_id",
                        numOfTickets: { $sum: 1},
                        numOfSolvedTickets: {
                            $sum: { $cond: [ { $eq: ["$status", ticket_status.solved]}, 1, 0 ]}
                        }
                    }
                }
            ]

            const result = await TicketModel.aggregate(pipeline);

            if(result.length == 1) return result[0];

            else return { numOfTickets: 0, numOfSolvedTickets: 0};
            
        }catch(error){
            
            throw error;
        }
    }

    //* Retrieve the ticket list of project to display
    static async getTicketByProject(projectId) {

        try {

            const filter = { project_id: projectId };

            // Specify the field of ticket we need
            const projectedTicket = {
                _id: 1,
                name: 1,
                created_date: 1,
                due_date: 1,
                status: 1,
                priority: 1,
                description: 1,
                client_id:1,
                selectedLeaderID: 1
            }

            return await TicketModel.find(filter, projectedTicket).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

        //* Retrieve the ticket list of task to display
    static async getTicketByTask(taskId) {

        try {

            const filter = { task_id: taskId };

            // Specify the field of ticket we need
            const projectedTicket = {
                _id: 1,
                name: 1,
                created_date: 1,
                due_date: 1,
                status: 1,
                priority: 1,
                description: 1,
                client_id:1,
                selectedLeaderID: 1
            }

            return await TicketModel.find(filter, projectedTicket).sort({ due_date: 1 });

        } catch (error) {
            throw error;
        }
    }

    //* When the project's `selectedLeaderID` || `selectedEngineersID` is changed, check and remove the removed "ENGINEER" as well
    static async updateEngineerList(project_id, selectedEngineersList){

        try{

            await TicketModel.updateMany
            (
                { project_id: project_id },
                { $pull: { selectedEngineersID: { $nin: selectedEngineersList }}}
            )
            
        }catch(error){
            throw error;
        }
    }

    //* Retrieve the ticket list of a deleted project
    static async getTicketToDelete(project_id) {

        try {

            const filter = { project_id: project_id };

            // Specify the field of task we need
            const projectedTicket = {
                _id: 1,
                attachments: 1,
            }

            return await TicketModel.find(filter, projectedTicket);

        } catch (error) {
            throw error;
        }
    }

    //* Retrieve the ticket list of a deleted task
    static async getTaskTicket(task_id) {

        try {

            const filter = { task_id: task_id };

            // Specify the field of task we need
            const projectedTicket = {
                _id: 1,
                project_id: 1,
                attachments: 1,
            }

            return await TicketModel.find(filter, projectedTicket);

        } catch (error) {
            throw error;
        }
    }

    //* Delete all the tickets related to a deleted project
    static async deleteProjectTicket(projectId) {

        try {

            const result = await TicketModel.deleteMany({ project_id: projectId });

            return result;

        } catch (error) {
            throw error;
        }
    }

    //* Delete all the tickets related to a deleted task
    static async deleteTaskTicket(task_id) {

        try {

            const result = await TicketModel.deleteMany({ task_id: task_id });

            return result;

        } catch (error) {
            throw error;
        }
    }

    //* Check how many "Solved" ticket of a project (Aggregation pipeline => Processes done at database - More efficient)
    static async countProjectProgress(project_id){
        try {

            //* Aggregation Pipeline Syntax
            const pipeline = [
                {
                    //* 1. Find the "Task" documents with matching "project_id"
                    $match: { project_id: new mongoose.Types.ObjectId(project_id) }
                },
                {
                    //* 2. Group the "Task" documents together by "project_id"
                    $group: {
                        _id: "$project_id",
                        //* 3. Calculate the total number of ticket with specified "project_id" (Result 1)
                        totalCounts: { $sum: 1 },
                        //* 4. From the matching tickets, calculate where its "status" == "Pending" (Result 2)
                        numOfPending: {
                            $sum: {
                                //? $cond: [ <expression>, <value-if-true>, <value-if-false>]
                                $cond: [ { $eq: ["$status" , ticket_status.pending] }, 1, 0 ]
                            }
                        },
                        //* 4. From the matching tickets, calculate where its "status" == "Reopened" (Result 2)
                        numOfReopened: {
                            $sum: { $cond: [ { $eq: ["$status", ticket_status.reopened] }, 1, 0] }
                        },
                        //* 4. From the matching tickets, calculate where its "status" == "Solved" (Result 2)
                        numOfSolved: {
                            $sum: { $cond: [ { $eq: ["$status", ticket_status.solved] }, 1, 0 ] }
                        }
                    }
                }
            ];

            const result = await TicketModel.aggregate(pipeline);
    
            // The result will be an array, but since we're matching by project_id, it should have only one element.
            if (result.length === 1) return result[0];

            // Return default values / throw an error if needed
            else return undefined;

        } catch (error) {

            throw error;
        }
    }

    //* Check how many "Solved" ticket of a task (Aggregation pipeline => Processes done at database - More efficient)
    static async countTaskProgress(task_id){
        try {

            //* Aggregation Pipeline Syntax
            const pipeline = [
                {
                    //* 1. Find the "Task" documents with matching "project_id"
                    $match: { task_id: new mongoose.Types.ObjectId(task_id) }
                },
                {
                    //* 2. Group the "Task" documents together by "project_id"
                    $group: {
                        _id: "$task_id",
                        //* 3. Calculate the total number of ticket with specified "project_id" (Result 1)
                        totalCounts: { $sum: 1 },
                        //* 4. From the matching tickets, calculate where its "status" == "Pending" (Result 2)
                        numOfPending: {
                            $sum: {
                                //? $cond: [ <expression>, <value-if-true>, <value-if-false>]
                                $cond: [ { $eq: ["$status" , ticket_status.pending] }, 1, 0 ]
                            }
                        },
                        //* 4. From the matching tickets, calculate where its "status" == "Reopened" (Result 2)
                        numOfReopened: {
                            $sum: { $cond: [ { $eq: ["$status", ticket_status.reopened] }, 1, 0] }
                        },
                        //* 4. From the matching tickets, calculate where its "status" == "Solved" (Result 2)
                        numOfSolved: {
                            $sum: { $cond: [ { $eq: ["$status", ticket_status.solved] }, 1, 0 ] }
                        }
                    }
                }
            ];

            const result = await TicketModel.aggregate(pipeline);
    
            // The result will be an array, but since we're matching by project_id, it should have only one element.
            if (result.length === 1) return result[0];

            // Return default values / throw an error if needed
            else return { _id: task_id, totalCounts: 0, numOfPending: 0, numOfReopened: 0, numOfSolved: 0 };

        } catch (error) {

            throw error;
        }
    }

    //? Remarks and KPI calculation
    static async getTicketPercent(engineer_id, startDate, endDate){
        try{
            const pipeline = [
                {
                    $match: {
                        selectedLeaderID: engineer_id,
                        due_date: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    resolvedTickets: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$status", ticket_status.solved] },
                                        { $gte: ["$completed_date", startDate] },
                                        { $lte: ["$completed_date", endDate] }
                                    ]
                                }, 1, 0]
                        }
                    }
                    }
                }
                ];
                
                const result = await TicketModel.aggregate(pipeline).exec();
                
                const totalTickets = result[0]?.totalTickets || 0;
                const resolvedTickets = result[0]?.resolvedTickets || 0;

                return { totalTickets, resolvedTickets };
                
        }catch(error){

            throw error;
        }
    }
}

module.exports = TicketService;