const mongoose = require('mongoose');
const AttachmentSchema = require('../models/Attachment.model');
const { project_type } = require('../constants');

// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */
const projectSchema = new Schema({
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: 
        [
            project_type.NEW_SUPPLY,
            project_type.MAINTENANCE_CONTRACT,
            project_type.OUT_OF_CONTRACT_SUPPORT,
            project_type.OTHERS
        ]
    },
    created_date: {
        // Format: YYYY-MM--DD
        type: Date,
        default: Date.now,
    },
    due_date: {
        // Format: YYYY-MM--DD
        type: Date,
        required: true,
    },
    completed_date: {
        type: Date,
        required: false
    },
    status: {
        //"Pending", "Completed", "On Hold"
        type: String,
        required: true,
    },
    priority: {
        // "Low", "Medium", "High"
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    attachments: [AttachmentSchema]
});

const projectCollection = mongoose.model('project', projectSchema);

module.exports = projectCollection;