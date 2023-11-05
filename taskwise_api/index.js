//* Entry point to database
//* Import "app" object from 'app.js'
const app = require('./app');

//* Import "mongodb" object from 'db.js'
const mongodb = require('./config/db');
//* Import "employeeCollection" object from 'employee.model.js'
const projectCollection = require('./models/Project.model');
const taskCollection = require('./models/Task.model');
const ticketCollection = require('./models/Ticket.model')
const userCollection = require('./models/User.model');
const notificationCollection = require('./models/Notification.model');
const chatCollection = require('./models/Chat.model');