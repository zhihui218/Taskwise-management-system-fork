const TicketService = require("../services/ticket.service");
const FileController = require('../utils/file.controller');
const ChatController = require('../controllers/chat.controller');
const NotificationController = require('../controllers/notification.controller');
const { type, notification_type, ticket_status } = require('../constants');

exports.createTicket = async(req, res, next) => {

    try{
        // Retrieve the files uploaded
        const files = req.files;

        const ticket = req.body;

        // Create the ticket so that we can retrieve its "_id"
        const createdTicket = await TicketService.createTicket(ticket);

        await uploadFiles(files, createdTicket._id);

        //? Push Notification
        await NotificationController.createNotification(createdTicket, type.ticket, notification_type.ticket_created)

        // Pass to the next middleware, "checkTaskProgress" && "checkProjectProgress" to update project's status (if necessary)
        req.result = true;
        req.task_id = createdTicket.task_id;
        req.project_id = createdTicket.project_id;

        // Call to next middleware
        next();

    }catch(error){

        res.status(500).json(false)

        return next(new Error(error));
    }
}

exports.getAllTicket = async(req, res, next) => {

    try {

        const tickets = await TicketService.getAllTickets();

        res.status(200).json({ tickets: tickets })

    } catch (error) {

        res.status(500).json({ tickets: undefined })

        return next(new Error(error));
    }
}

exports.getTicketById = async(req, res, next) => {

    try {
        // Should in the format of "YYYY-MM--DD"
        const ticket_id = req.params.id;

        const ticket = await TicketService.getTicketById(ticket_id);

        //? Get task's name and ticket's leader details
        req.ticket = ticket;

        next();

    } catch (error) {

        res.status(500).json(undefined);

        return next(new Error(error));
    }
}

exports.paginateTicket = async(req, res, next) => {

    try{

        //* Pagination
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const startIndex = (page - 1)* limit;
        const endIndex = page * limit;

        let numOfDocs; let ticketPaginate;

        //? The user is accessing the ticket list of a "Task" / "Project"
        if(req.params.task_id || req.params.project_id){
            const model_id = req.params.task_id || req.params.project_id;
            numOfDocs = await TicketService.countDocsNumOfTask(req.params.task_id ? type.task : type.project, model_id);
            ticketPaginate = await TicketService.paginateTaskTickets(req.params.task_id ? type.task : type.project, model_id, limit, startIndex);
        }
        //? For a specific user "Engineer" / "Manager"
        else{
            //* Check the user roles from the `jwtToken`
            const user_role = req.role;
            //* Check whether a user_ id is provided
            const user_id = req.params.user_id;
            numOfDocs = await TicketService.countDocsNum(user_id, user_role);
            ticketPaginate = await TicketService.paginateTickets(user_id, user_role, limit, startIndex);
        }

        req.paginated = {
            numOfDocs: numOfDocs,
            docs: ticketPaginate,
            nextPage: endIndex < numOfDocs ? page + 1 : undefined,
            previousPage: startIndex > 0 ? page - 1 : undefined,
            limit: limit
        }

        next();

    }catch(error){

        res.status(500).json({});

        return next(new Error());
    }
}

exports.updateTicket = async(req, res, next) => {

    try {

        const ticketId = req.params.id;

        // Retrieve the files uploaded
        const files = req.files;

        const updatedTicket = req.body;

        //* Latest task without "Attachment" updated
        const latest = await TicketService.updateTicket(ticketId, updatedTicket);

        //* Latest task with "Attachment" updated (Possibly "null" because attachment is OPTIONAL)
        const result = await uploadFiles(files, ticketId);

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = result ? result : latest;
        req.task_id = latest.task_id;
        req.project_id = latest.project_id;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(500).json({
            status: false,
            ticket: undefined
        })

        return next(error);
    }
}

exports.updateTicketStatus = async(req, res, next) => {
    try {

        const ticket_id = req.params.id;

        const status = req.body['status'];

        const result = await TicketService.updateTicketStatus(ticket_id, status);

        //? Push notification if the ticket.status == solved / reopened
        if(result.status == ticket_status.reopened || result.status == ticket_status.solved){
            await NotificationController.createNotification(result, type.ticket, result.status == ticket_status.reopened ? notification_type.ticket_reopened : notification_type.ticket_solved);
        }

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = result;
        req.task_id = result.task_id;
        req.project_id = result.project_id;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(500).json(undefined);

        return next(error);
    }
}

exports.updateTicketDueAndEng = async(req, res, next) => {
    try {

        const ticket_id = req.params.id;

        const ticket = req.body;

        const result = await TicketService.updateTicketDueAndEng(ticket_id, ticket);

        //? Push Notification when due date of a ticket is set
        if(result.due_date) await NotificationController.createNotification(result, type.ticket, notification_type.ticket_due_date);

        res.status(200).json(true);

    } catch (error) {

        res.status(500).json(false);

        return next(error);
    }
}

exports.deleteTicketAttachment = async(req, res, next) => {

    try {

        const ticket_id = req.params.id;

        const attachments = req.body;

        // 1. Delete all the chosen files of a ticket
        await FileController.deleteFiles(attachments);

        // 2. Generate another array which stores a list of "cloudinary_id" for chosen files
        const cloudinaryList = attachments.map((attachment) => attachment.cloudinary_id);

        // 3. Delete the "AttachmentSchema" object stored within the ticket
        const ticket = await TicketService.deleteTicketAttachment(ticket_id, cloudinaryList);


        res.status(200).json({
            status: true,
            ticket: ticket
        });

    } catch (error) {

        res.status(500).json({
            status: false,
        })

        return next(error);
    }
}

exports.deleteTicket = async(req, res, next) => {

    try {

        const ticket_id = req.params.ticketId;

        //* The folder to be deleted MUST BE "EMPTY"
        await FileController.deleteFolder(type.ticket, ticket_id);
        //* Delete all its relevant chat
        await ChatController.deleteTicketChat(ticket_id);

        const deletedTask = await TicketService.deleteTicket(ticket_id);

        // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
        req.result = true;
        req.task_id = deletedTask.task_id;
        req.project_id = deletedTask.project_id;

        // Call to next middleware
        next();

    } catch (error) {

        res.status(400).json(false)

        return next(error);
    }
}

/** Needed by "Project" Module */
exports.countProjectTicket = async(req, res, next) => {
    
    try{

        const project_id = req.params.project_id;

        const result = await TicketService.countProjectTicket(project_id);

        res.status(200).json(result);
        
    }catch(error){

        res.status(400).json(undefined);

        return next(error);

    }
}

exports.getTicketByProject = async(req, res, next) => {

    try {

        const projectId = req.params.projectId;

        const ticketList = await TicketService.getTicketByProject(projectId);

        res.status(200).json({
            status: true,
            tickets: ticketList,
        })

    } catch (error) {

        res.status(500).json({
            status: false,
            tasks: undefined,
        })

        return next(new Error(error));
    }
}

exports.getTicketByTask = async(req, res, next) => {

    try {

        const taskId = req.params.taskId;

        const ticketList = await TicketService.getTicketByTask(taskId);

        res.status(200).json({
            status: true,
            tickets: ticketList,
        })

    } catch (error) {

        res.status(500).json({
            status: false,
            tasks: undefined,
        })

        return next(new Error(error));
    }
}

exports.updateEngineerList = async(req, res, next) => {

    try{
        const project_id = req.params.project_id;

        //* From the "Project" object
        const engineerIDList = req.body;

        await TicketService.updateEngineerList(project_id, engineerIDList);

        res.status(200).json(true);

    }catch(error){

        res.status(500).json(false);

        return next(new Error(error));
    }
}

exports.deleteTicketByProject = async(req, res, next) => {

    try {

        // 1. Get the `_id` of deleted project
        const projectId = req.params.project_id;

        // 2. Retrieve all the "Ticket" docs which is related to the deleted project
        const ticketList = await TicketService.getTicketToDelete(projectId);

        if(ticketList.length > 0){
        
            // 3. For each "Ticket" doc, delete its files in `Cloudinary` (Reason: Folder can be deleted ONLY if it's empty)
            for(const ticket of ticketList) 
            {
                await FileController.deleteFiles(ticket.attachments);

                // 4. Once all the `attachments` are deleted, remove the folder for the "Task" doc in `Cloudinary`
                await FileController.deleteFolder(type.ticket, ticket._id);

                // 5. Delete all its relevant chat
                await ChatController.deleteTicketChat(ticket._id);
            }

            // 6. Finally, delete the ALL "Task" docs related to the project
            const result = await TicketService.deleteProjectTicket(projectId);
        }

        res.status(200).json(true);

    } catch (error) {

        res.status(400).json(false);

        return next(error);
    }
}

exports.deleteTicketByTask = async(req, res, next) => {

    try {

        // 1. Get the `_id` of deleted task
        const task_id = req.params.task_id;

        // 2. Retrieve all the "Ticket" docs which is related to the deleted task
        const ticketList = await TicketService.getTaskTicket(task_id);

        if(ticketList.length > 0){

            //? After deleting all the associated tickets, we need to check the project progress && update its status
            const project_id = ticketList[0].project_id;
        
            // 3. For each "Ticket" doc, delete its files in `Cloudinary` (Reason: Folder can be deleted ONLY if it's empty)
            for(const ticket of ticketList) 
            {
                await FileController.deleteFiles(ticket.attachments);

                // 4. Once all the `attachments` are deleted, remove the folder for the "Task" doc in `Cloudinary`
                await FileController.deleteFolder(type.ticket, ticket._id);

                // 5. Delete all its relevant chat
                await ChatController.deleteTicketChat(ticket._id);
            }

            // 6. Finally, delete the ALL "Task" docs related to the project
            const result = await TicketService.deleteTaskTicket(task_id);

            // Pass to the next middleware, "checkProjectProgress" to update project's status (if necessary)
            req.result = true;
            req.task_id = task_id;
            req.project_id = project_id;

            // Call to next middleware
            next();
        }
        else{ res.status(200).json(true); }


    } catch (error) {

        res.status(400).json(false);

        return next(error);
    }
}

exports.getProjectProgress = async(req, res, next) => {

    try{
        //* 1. Retrieve the target "_id" of a "Project"
        const project_id = req.params.project_id;

        //* 2. Calculate and return the tickets where "project_id == project_id" && "status == Solved / Pending / Reopened"
        const result = await TicketService.countProjectProgress(project_id);
        
        res.status(200).json(result);

    }catch(error){
        
        res.status(500).json(undefined);
        return next(error);
    }
}

//* Called only when a file is uploaded
const uploadFiles = async(files, ticket_id) => {
    if(files && files.length > 0){
        // Upload the files of the ticket to "cloudinary"
        const uploadFiles = await FileController.uploadFile(files, type.ticket, ticket_id);
        // Put the necessary information of the files uploaded in the "ticket" document
        return await TicketService.updateTicketAttachment(ticket_id, uploadFiles);
    }
    return undefined;
}