const mongoose = require('mongoose');
const AttachmentSchema = require('../models/Attachment.model');

// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */
const ticketSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    created_date: {
        // Format: YYYY-MM--DD
        type: Date,
        default: Date.now,
    },
    completed_date: {
        // Format: YYYY-MM--DD
        type: Date,
        required: false,
    },
    due_date: {
        // Format: YYYY-MM--DD
        type: Date,
        required: false,
    },
    status: {
        // "Pending", "Solved", "Reopened"
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
    selectedLeaderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [AttachmentSchema]
});

const ticketCollection = mongoose.model('ticket', ticketSchema);

module.exports = ticketCollection;