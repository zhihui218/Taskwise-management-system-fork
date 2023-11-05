const mongoose = require('mongoose');
const AttachmentSchema = require('../models/Attachment.model');

// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */
const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    due_date: {
        // Format: YYYY-MM--DD
        type: Date,
        required: true,
    },
    estimatedCompletedHour: {
        type: Number,
        required: true,
    },
    created_date: {
        // Format: YYYY-MM--DD
        type: Date,
        default: Date.now,
    },
    completed_date: {
        type: Date,
        required: false
    },
    status: {
        //"In Progress", "Completed", "On Hold", and "Cancelled"
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
    projectID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    selectedLeaderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    selectedEngineersID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    }],
    attachments: [AttachmentSchema]
});

const taskCollection = mongoose.model('task', taskSchema);

module.exports = taskCollection;