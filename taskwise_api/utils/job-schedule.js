const schedule = require('node-schedule');
const startOfWeek = require('date-fns/startOfWeek');
const endOfWeek = require('date-fns/endOfWeek');
const UserModel = require('../models/User.model');
const TaskModel  =require('../models/Task.model');
const { roles, status } = require('../constants');

//? https://crontab.cronhub.io/ => Can check syntax for data used for `node-schedule`

//? Schedule the job to rSun every Monday at 12 AM (Reset the  `currentWorkingHour` of all employee every week)
const job = schedule.scheduleJob('0 0 * * 1', async function() {
    // Retrieve the start & end date of each week
    const currentDate = new Date();
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    try {
        //* 1. Retrieve all the list of users
        const engineers = await UserModel.find({ role: roles.engineer }, { currentWorkingHour: 1 });
        for(const engineer of engineers){
            //* 2. Retrieve the task with due_date at "NEW WEEK" but not "COMPLETED" assigned to each of the engineer
            const tasks = await TaskModel.find(
                { 
                    $or: [{ selectedLeaderID: engineer._id }, { selectedEngineersID: engineer._id }],
                    due_date: { $gte: start, $lte: end },
                    status: { $in: [status.pending, status.onHold] }
                })

            //* 3. Increment the `currentWorkingHour` of the engineer for "THIS NEW WEEK"
            let latestWorkingHour = 0;
            for(const task of tasks) latestWorkingHour += task.estimatedCompletedHour;

            //* 4. Update && save the engineer
            engineer.currentWorkingHour = latestWorkingHour;
            engineer.$locals.isUpdateWorkingHour = true; //? To be passed to the "pre-save" hook
            await engineer.save();
        }
        console.log('Update Successfully!')
    } catch (err) {
        console.log('Error:', err);
        return next(new Error(err));
    }
});

module.exports = { job };

/**
⁡⁣⁢⁢𝗖͟𝗿͟𝗼͟𝗻͟-͟𝗦͟𝘁͟𝘆͟𝗹͟𝗲 𝗦͟𝗰͟𝗵͟𝗲͟𝗱͟𝘂͟𝗹͟𝗶͟𝗻͟𝗴⁡
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */