const mongoose = require('mongoose');
// Import "Schema" object from 'mongoose'
const { Schema } = mongoose;

const ChatSchema = new Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    //? Check which session the chat belongs to
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Ticket"
    },
    //? Check if the `recipient` has read the message
    isRead: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        required: true
    },
    deleteBy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: false
    }]
}, { timestamps: true, versionKey: false, strict: true });

const chatCollection = mongoose.model('chat', ChatSchema);

module.exports = chatCollection;