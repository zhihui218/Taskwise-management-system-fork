// Handle requests from user && send response to user
const attachmentService = require('../services/attachment.service');
const formidable = require('formidable');
const cloudinary = require('../utils/cloudinary');
const crypto = require("crypto");
const path = require("path");


exports.uploadAttachment = async(req, res, next) => {
    try {
        const form = formidable({ multiples: true });

        form.parse(req, async(err, fields, files) => {

            if (fields['numOfFiles'] == 1) {

                const file = Object.values(files)[0];

                await attachmentService.uploadAttachment(fields['id'], file, fields['isProject']);

            } else {

                const file = Object.values(files)[0];

                for (var i = 0; i < file.length; i++) await attachmentService.uploadAttachment(fields['id'], file[i], fields['isProject']);
            }

            res.status(200).json({
                status: true,
                message: 'Create a project successfully!'
            })

        });
    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(error);
    }
}

exports.getProjectAttachment = async(req, res, next) => {
    try {

        const projectId = req.query.id;

        const attachmentList = await attachmentService.getAttachmentByProject(projectId);

        res.status(200).json({
            status: true,
            attachments: attachmentList
        });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(error);
    }
}

exports.getTaskAttachment = async(req, res, next) => {
    try {

        const taskId = req.query.id;

        const attachmentList = await attachmentService.getAttachmentByTask(taskId);

        res.status(200).json({
            status: true,
            attachments: attachmentList
        });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(error);
    }
}

exports.deleteAttachments = async(req, res, next) => {
    try {

        const attachmentList = req.body['attachments'];

        const deleteResult = await attachmentService.deleteAttachments(attachmentList);

        res.status(200).json({
            status: true,
            result: deleteResult
        });

    } catch (error) {

        res.status(400).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(error);
    }
}

exports.deleteAttachmentsByTasks = async(req, res, next) => {

    try {

        const taskID = req.params.taskId;

        const result = await attachmentService.deleteAttachmentsByTask(taskID);

        res.status(200).json({
            status: true,
            result: result
        })

    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Something went wrong',
        })

        return next(error);
    }
}

exports.deleteAttachmentsByProjects = async(req, res, next) => {
        try {

            const projectID = req.params.projectId;

            const result = await attachmentService.deleteAttachmentsByProject(projectID);

            res.status(200).json({
                status: true,
                result: result
            })

        } catch (error) {

            res.status(500).json({
                status: false,
                message: 'Something went wrong',
            })

            return next(error);
        }
    }
    /**                                  Latest                                */
exports.uploadFile = async(req, res, next) => {
    try {

        const files = req.files;

        // Check whether the files belongs to "project / task / ticket"
        const type = req.headers["type"];

        const project = req.body;

        for(const file of files){
            //* Generate unique id for the file uploaded
            const unique_id = crypto.randomUUID();

            //* Retrieve the extension of file (E.g., .pptx)
            const extension = path.extname(file.originalname);

            //* Generate a unique "public_id" of file in cloudinary (No need add extension for image/pdf)
            const public_id = (extension == '.png' || extension == '.jpg' || extension == '.jpeg' || extension == '.pdf') ? unique_id : unique_id + extension

            //* Upload the file to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                public_id: public_id,
                resource_type: "auto"
            })

            //* Store the necessary details of the file in the "Attachment" model
            const uploaded = await attachmentService.uploadFiles(result.public_id, result.secure_url, file.originalname);

            console.log(uploaded);
        }

        res.status(200).json({
            status: true,
            // file: uploaded
        });

    } catch (error) {

        res.status(500).json({
            status: false,
            message: 'Something went wrong, please try again later'
        })

        return next(error.message);
    }
}

exports.getFile = async(req, res, next) => {
    try {

        const _id = req.params._id;

        const file = await attachmentService.getFile(_id);

        res.status(200).json({
            status: true,
            file: file
        });

    } catch (error) {
        res.status(500).json({
            status: fasle,
            message: 'Something went wrong, please try again later'
        })
        return next(error.message);
    }
}

exports.deleteFile = async(req, res, next) => {
    try {

        const _id = req.params._id;

        const file = await attachmentService.deleteFile(_id);

        //* Retrieve the extension of file (E.g., .pptx)
        const extension = path.extname(file.fileName);

        //* Need to set "resource_type： 'raw'" if the file is raw file
        const isRaw = (extension == '.png' || extension == '.jpg' || extension == '.jpeg' || extension == '.pdf') ? false : true;

        await cloudinary.uploader.destroy(file.cloudinary_id, { invalidate: true, resource_type: isRaw ? "raw" : "image" });

        res.status(200).json({
            status: true,
            deleted: file
        })

    } catch (error) {

        res.status(500).json({
            status: false,
            messsage: 'Something went wrong, please try again later'
        })

        return next(error.message);
    }
}