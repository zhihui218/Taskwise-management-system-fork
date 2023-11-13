//* Importing necessary packages
const express = require('express');
const cors = require('cors');

// Assemble the request data into easily accessible JSON format
const body_parser = require('body-parser');

//For ANGULAR
// //* Create an 'Express' object and assign to "app"
const app = express();

//? Configuration of socket.io for real-time bidirectional communication
const http = require('http');
const server = http.Server(app);
const { initialize } = require('./server');
initialize(server);
const port = 3000;
server.listen(port, () => { console.log(`Server listening on port: ${port}`) });


//? Scheduling of automatic job execution
const { job } = require('./utils/job-schedule');

var corsOptions = { origin: true };


// Middleware
app.use(cors(corsOptions));
// app.use(body_parser.urlencoded({ extended: true }));
// app.use(body_parser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// All API Endpoints (Mount '/prefix' for different type of routes)
//? app.use('/task', isAuthorized, require('./routes/task.route')); => Every request enters `./routes/task.route` will always have '/task' attached to the front of the request url
app.use('/project', require('./routes/project.route'));
app.use('/attachment', require('./routes/attachment.route'));
app.use('/task', require('./routes/task.route'));
app.use('/user', require('./routes/user.route'));
app.use('/ticket', irequire('./routes/ticket.route'));
app.use('/notification', require('./routes/notification.route'));
app.use('/dashboard', require('./routes/dashboard.route'));
app.use('/chat', require('./routes/chat.route'));

//* "Object" to be returned when "required()" is invoked
module.exports = app;
