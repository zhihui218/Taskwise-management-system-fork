// Middlewares to handle file upload in MongoDB
const multer = require("multer");
const path = require("path");

// Multer config
//* cb(error, whether to accept file)
module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".png", ".jpeg", ".jpg", ".pdf", ".doc", ".docx", ".ppt", ".pptx"];
        let ext = path.extname(file.originalname);
        if (!allowedExtensions.includes(ext.toLowerCase())) {
            cb(new Error("File type is not supported"), false);
            // Avoid proceeding to the next step since error is found
            return;
        }
        //* No error -> Accept files -> Proceed to next step
        cb(null, true);
    },
});