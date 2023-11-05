import { UserGetDTO } from "../modules/auth";
import { AttachmentGetDTO } from "./AttachmentDTO";
import { ProjectTicketProgressTrackerDTO, TaskTicketProgressGetDTO } from "./ProgressGetDTO";
import { ProjectTaskGetDTO } from "./ProjectDTO";

export interface TaskPostDTO{
    name: string;
    due_date: string;
    estimatedCompletedHour: number,
    status: string;
    priority: string;
    description: string;
    projectID: string;
    client_id: string;
    selectedLeaderID: string,
    selectedEngineersID: string[],
    // selectedEngineersID: string[];
    attachments: File[];
}

export interface TaskGetDTO{
    _id: string;
    name: string;
    created_date: string,
    due_date: string;
    completed_date?: string;
    status: string;
    priority: string;
    description: string;
    projectID: string;
    client_id: string;
    selectedLeaderID: string,
    selectedEngineersID: string[],
    attachments: AttachmentGetDTO[];
    numOfTicket?: number; // at "Projects" component
    ticket_progress?: TaskTicketProgressGetDTO;
    //? Get at the frontend
    selectedLeader?: UserGetDTO,
    project?: ProjectTaskGetDTO;
    selectedEngineers?: UserGetDTO[],
    //? Conversion from `estimatedCompletedHour`
    day: number;
    hour: number;
    minute: number;
}

export interface TaskDashboardDTO{
    _id: string;
    name: string;
    due_date: string;
    status: string;
    priority: string;
    selectedLeaderID: string;
    selectedEngineersID: string[];
    //* Get at front end (For "Client" site)
    selectedLeader?: UserGetDTO;
    selectedEngineers?: UserGetDTO[];
    completed_date?: string;
}

//* "Task" Object for displaying task list of a project
export interface TaskProjectGetDTO{
    _id: string,
    name: string,
    due_date: string,
    status: string,
    description: string,
    selectedEngineersID: string[];
    //* Retrieved at Mission-Overview Component
    engineers?: UserGetDTO[];
}

export interface TaskProgressGetDTO{
    taskID: number;
    name: string;
    status: string;
}

//? Needed to generate "Monthly Report"
export interface TaskReportDTO {
    name: string;
    due_date: string;
    status: string;
    priority: string;
    selectedLeaderID: string;
    selectedLeader: UserGetDTO;
    selectedEngineersID?: string[];
    //* "Pending" && "Reopened" task doesn't have `completed_date`
    completed_date?: string;
}