const cloudinary = require('../utils/cloudinary');
const crypto = require("crypto");
const path = require("path");

class FileController{

    //* Upload files for "project / task / ticket"
    static async uploadFile(files, type, id){
        try{
            const fileList = [];
            
            for(const file of files){
                //* Generate unique id for the file uploaded
                const unique_id = crypto.randomUUID();
    
                //* Retrieve the extension of file (E.g., .pptx)
                const extension = path.extname(file.originalname);
    
                //* Generate a unique "public_id" of file in cloudinary (No need add extension for image/pdf)
                const public_id = (extension == '.png' || extension == '.jpg' || extension == '.jpeg' || extension == '.pdf') ? unique_id : unique_id + extension
    
                //* Upload the file to "Cloudinary"
                const result = await cloudinary.uploader.upload(file.path, {
                    public_id: public_id,
                    resource_type: "auto",
                    //* Upload to the folder corresponding to the specific "project / task / ticket"
                    folder: `${type}/${id}`,
                    // flags: `attachment`
                })

                fileList.push
                ({
                    // Exactly same as "AttachmentSchema" in attachment.model.ts
                    cloudinary_id: result.public_id,
                    file_url: result.secure_url,
                    fileName: file.originalname
                }
                );
            }

            return fileList;

        }catch(error){
            console.error(error);
            throw error;
        }
    }

    //* Delete all the "UPLOADED" files from "Cloudinary"
    static async deleteFiles(attachments) {

        try {
            for(const file of attachments){
                //* Retrieve the extension of file (E.g., .pptx)
                let extension = path.extname(file.fileName);

                extension = extension.toLowerCase();
    
                //* Need to set "resource_type： 'raw'" if the file is raw file
                const isRaw = (extension == '.png' || extension == '.jpg' || extension == '.jpeg' || extension == '.pdf') ? false : true;
    
                await cloudinary.uploader.destroy(file.cloudinary_id, { invalidate: true, resource_type: isRaw ? "raw" : "image" });
            }

            return true;
    
        } catch (error) {
            throw error;
        }
    }

    //* Delete the entire folder for a specific project IF the project is deleted
    static async deleteFolder(type, asset_id) {
        try {

            //* 1. Get all the subfolders under "project / task / ticket" folder
            const subFolders = await cloudinary.api.sub_folders(`${type}`);

            //* 2. Since attachment is optional, we delete the folder of specific "project / task / ticket" only if attachments does exist
            for(const subFolder of subFolders['folders']){
                //* We use the "_id" of the "project / task / ticket" as "name" of each subfolder
                const _id = subFolder.name;
                if(_id == asset_id){
                    await cloudinary.api.delete_folder(`${type}/${asset_id}`);
                    break;
                }
            }


            // const suffix = subFolders['folders'].map((subFolder) => {
            //     // Retrieve the '_id" property of "project / task / ticket" (We use the project id as the folder)
            //     const array = subFolder['path'].split('/');
            //     return array[array.length - 1];
            // })

            // console.log(suffix);

            // console.log(asset_id);

            // console.log(suffix == asset_id);

            // //* Delete only the folder for SPECIFIC project exists
            // if(suffix == asset_id) await cloudinary.api.delete_folder(`${type}/${asset_id}`);
    
        } catch (error) {

            console.error(error);
            throw error;
        }
    }
}

module.exports = FileController;