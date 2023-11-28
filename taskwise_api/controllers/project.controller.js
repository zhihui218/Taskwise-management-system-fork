// Handle requests from user && send response to user
const projectService = require('../services/project.service');
const FileController = require('../utils/file.controller');
const { type, status, notification_type, roles } = require('../constants');
const NotificationController = require('../controllers/notification.controller');
// ADD THIS LINE
const Decorator = require("../utils/decorator");

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


// ADD DECORATORS
exports.getProjectById = async(req, res, next) => {

    try {

        const projectId = req.params.projectId;

        const project = await projectService.getProjectById(projectId);

        //? Decorate the project with necessary behaviors
        let decorated = project.toJSON();
        decorated = await Decorator.clientDetails(decorated);
        decorated = await Decorator.getProjectEngineers(decorated);

        res.status(200).json({ project: decorated })

    } catch (error) {

        res.status(500).json(undefined)

        return next(new Error(error));
    }
}

// ADD ROLE-BASED ACCESS
exports.paginateProject = async(req, res, next) => {

    try{
        //* Pagination
        const { page, limit, startIndex, endIndex } = paginationDetails(req);
        const client_id = req.params.client_id;

        let numOfDocs; let projectPaginate;

        if(req.user.role == roles.client || client_id){
            numOfDocs = await projectService.countClientProjectNum(client_id ? client_id : req.user._id);
            projectPaginate = await projectService.paginateClientProjects(client_id ? client_id : req.user._id, limit, startIndex);
        }
        else if(req.user.role == roles.manager){
            numOfDocs = await projectService.countProjectNum();
            projectPaginate = await projectService.paginateAllProjects(limit, startIndex);
        }
        else{ throw new Error("Invalid user or roles"); }

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

// ADD DECORATORS
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

        let decorated = result ? result.toJSON() : latest.toJSON();
        decorated = await Decorator.clientDetails(decorated);

        res.status(200).json({
            status: true,
            project: decorated
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

        const project = await deleteAttachments(projectID, attachments);

        res.status(200).json(project.attachments);

    } catch (error) {

        res.status(500).json(undefined);

        return next(error);
    }
}

exports.deleteProject = async(req, res, next) => {

    try {
        const projectId = req.params.projectId;

        const project = await projectService.getProjectById(projectId);

        await deleteAttachments(projectId, project.attachments);

        //* The folder to be deleted MUST BE "EMPTY"
        await FileController.deleteFolder(type.project, projectId);

        await NotificationController.deleteNotificationByModelId(projectId);

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

const paginationDetails = (req) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1)* limit;
    const endIndex = page * limit;
    return { page, limit, startIndex, endIndex };
}

const deleteAttachments = async(project_id, attachments) => {
    // 1. Delete all the chosen files of a project
    await FileController.deleteFiles(attachments);

    // 2. Generate another array which stores a list of "cloudinary_id" for chosen files
    const cloudinaryList = attachments.map((attachment) => attachment.cloudinary_id);

    // 3. Delete the "AttachmentSchema" object stored within the project
    const project = await projectService.deleteProjectAttachment(project_id, cloudinaryList);
    return project;
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