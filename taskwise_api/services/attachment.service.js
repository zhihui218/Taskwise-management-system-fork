const fs = require('fs');
const AttachmentModel = require('../models/Attachment.model');
const attachmentCollection = require('../models/Attachment.model');

class AttachmentService {

    static async uploadAttachment(id, file, isProject) {

        try {
            var fileName = file['originalFilename'];
            var lastIndex = fileName.lastIndexOf('.');
            var name = fileName.substr(0, lastIndex);
            var extension = fileName.substr(lastIndex + 1);
            const attachment = new AttachmentModel({
                filename: name,
                contentType: extension,
                data: fs.readFileSync(file['filepath']),
            });

            if (isProject == 'true') { attachment.projectID = id; } else { attachment.taskID = id; }

            await attachment.save();
        } catch (error) {
            throw error;
        }
    }

    static async getAttachmentByProject(projectID) {

        try {

            const queryFilter = { projectID: projectID };

            return await AttachmentModel.find(queryFilter);

        } catch (error) {
            throw error;
        }
    }

    static async getAttachmentByTask(taskID) {

        try {

            const queryFilter = { taskID: taskID };

            return await AttachmentModel.find(queryFilter);

        } catch (error) {
            throw error;
        }
    }

    static async deleteAttachments(attachmentList) {

        try {

            const filter = {
                _id: {
                    $in: attachmentList
                }
            }

            return await AttachmentModel.deleteMany(filter);

        } catch (error) {
            throw error;
        }
    }

    static async deleteAttachmentsByTask(taskID) {

        try {

            return await AttachmentModel.deleteMany({
                taskID: taskID
            })

        } catch (error) {
            throw error;
        }
    }

    static async deleteAttachmentsByProject(projectID) {

            try {

                return AttachmentModel.deleteMany({
                    projectID: projectID
                })

            } catch (error) {
                throw error;
            }
        }
        /**                                Latest  */
    static async uploadFiles(public_id, secure_url, name) {
        try {
            const file = new AttachmentModel({
                fileName: name,
                cloudinary_id: public_id,
                assets_url: secure_url
            })

            return await file.save();
        } catch (error) {
            throw error;
        }
    }

    static async getFile(_id) {
        try {

            return await attachmentCollection.findById(_id);

        } catch (error) {
            throw error;
        }
    }

    static async deleteFile(_id) {
        try {

            return await attachmentCollection.findByIdAndDelete(_id);

        } catch (error) {
            throw error;
        }
    }

    // static async updateFile(_id, file){
    //     try{



    //     } catch(error){
    //         throw error;
    //     }
    // }
}

module.exports = AttachmentService;