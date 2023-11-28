const UserService = require("../services/user.service");
const TaskService = require("../services/task.service");
const TicketService = require("../services/ticket.service");
const ProjectService = require("../services/project.service");

class Decorator{

    //? Decorate the object with client's details
    static async clientDetails(model){
        try{
            const client = await UserService.getClientById(model.client_id);
            const decorated_model = {
                ...model,
                client: client
            }
            return decorated_model;
        }catch(error){ throw error; }
    }

    //? Decorate the object with task name & `Main Contact Person` details
    static async taskAndLeader(model){
        try{
            const { name } = await TaskService.getTaskName(model.task_id)
            const leader = await UserService.getEngineerById(model.selectedLeaderID);
            const decorated_model = {
                ...model,
                task_name: name,
                selectedLeader: leader
            };
            return decorated_model;
        }catch(error){ throw error; }
    }

    //? Decorate the object with leader & engineer details
    static async leaderAndEngineers(model){
        const leader = await UserService.getEngineerById(model.selectedLeaderID);
        let selectedEngineers = [];
        if(model.selectedEngineersID){
            for(const engineer_id of model.selectedEngineersID){
                const selectedEngineer = await UserService.getEngineerById(engineer_id);
                selectedEngineers.push(selectedEngineer);
            }
        }
        const decorated_model = {
            ...model,
            selectedLeader: leader,
            selectedEngineers: selectedEngineers
        }
        return decorated_model;
    }

    //? Decorate the object with `project name`
    static async projectName(model){
        try{
            const { name } = await ProjectService.getProjectName(model.project_id);
            const decorated_model = {
                ...model,
                project_name: name
            }
            return decorated_model;
        }catch(error){ throw error; }
    }

    //? Decorate the project with all the engineers involved in its tasks;
    static async getProjectEngineers(project){
        try{
            //? Retrieve the engineer list by checking each task of the project
            const selectedEngineerList = [];
            const task_list = await TaskService.projectEngineers(project._id);
    
            //? Retrieve the personal details of each engineer
            for(const task of task_list){
                await checkEngineerExist(selectedEngineerList, task.selectedLeaderID);
                for(const engineer_id of task.selectedEngineersID) await checkEngineerExist(selectedEngineerList, engineer_id);
            }

            const decorated_project = {
                ...project,
                selectedEngineer: selectedEngineerList
            }
            return decorated_project;
        }catch(error){ throw error; }
    }

    //? Decorate the task with the `project` of that task
    static async taskProject(task){
        try{
            const project = await ProjectService.getProjectOfTask(task.projectID);
            const decorated_task = {
                ...task,
                project: project
            }
            return decorated_task;
        }catch(error){ throw error; }
    }

    //? Decorate the object with the number of tickets with respect to the task
    static async numOfTaskTicket(task){
        try{
            const numOfTickets = await TicketService.countTaskTicket(task._id);
            const decorated_model = {
                ...task,
                numOfTicket: numOfTickets
            }
            return decorated_model;
        }catch(error){ throw error; }
    }
}

const checkEngineerExist = async (engineerList, engineer_id) => {
    //? Append the engineer to the list only if it doesn't exist before
    if(!engineerList.find(engineer => engineer._id.equals(engineer_id))){
        const engineer = await UserService.getUserById(engineer_id);
        engineerList.push(engineer);
    }
}

module.exports = Decorator;