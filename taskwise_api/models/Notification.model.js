const mongoose = require('mongoose');
// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;
const { type } = require('../constants');

// Create a new "Schema" object
/*
 * 1. Define structure of the collection in MongoDB
 * 2. Define the type of data stored within the collection
 */

const recipientObj = new Schema(
{
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false,
    }
}, { _id: false })

const notificationSchema = new Schema({
    model_type: {
        type: String,
        enum: [ type.project, type.task, type.ticket ]
    },
    model_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'model_type'
    },
    notification_type: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
    },
    recipients: [ recipientObj ],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const notificationCollection = mongoose.model('notification', notificationSchema);

module.exports = notificationCollection;