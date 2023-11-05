// API Calls to store the files (images/*, pdf, docs, pptx) into "Cloudinary" file hosting services
const cloudinary = require("cloudinary").v2;
// Access environment variables
require('dotenv').config()

// Set up my Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


module.exports = cloudinary;