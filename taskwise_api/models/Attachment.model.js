const mongoose = require('mongoose');
// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */
const attachmentSchema = new Schema({
    cloudinary_id: {
        type: String,
        required: true,
    },
    file_url: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    }
}, { _id: false });

module.exports = attachmentSchema;