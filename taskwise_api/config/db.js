// Database connection with MongoDB using "mongoose" package
const mongoose = require('mongoose');

const url = "mongodb+srv://taskwise:taskwise0423@cluster01.wtkihol.mongodb.net/?retryWrites=true&w=majority";

const mongodb = mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('connected to database successfully'))


// Export this file to be used in other files
module.exports = mongodb;