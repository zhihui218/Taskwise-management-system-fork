import { UserGetDTO } from "../modules/auth";
import { AttachmentGetDTO } from "./AttachmentDTO";
import { ProjectTaskProgressGetDTO, ProjectTaskProgressTrackerDTO, ProjectTicketProgressGetDTO, ProjectTicketProgressTrackerDTO } from "./ProgressGetDTO";

//* Create a new project
export interface ProjectPostDTO{
    name: string;
    type: string;
    client_id: string;
    due_date: string;
    status: string;
    priority: string;
    description: string;
    attachments: File[];
}

export interface ProjectGetDTO{
    _id: string;
    client_id: string;
    name: string;
    type: string;
    created_date: string,
    due_date: string;
    completed_date?: string;
    status: string;
    priority: string;
    description: string;
    selectedEngineer: UserGetDTO[];
    attachments: AttachmentGetDTO[];
    // Properties that are assigned at frontend, not from api
    numOfTask?: ProjectTaskProgressTrackerDTO; // at "Projects" component
    numOfTicket?: ProjectTicketProgressTrackerDTO; // at "Projects" component
    task_progress?: ProjectTaskProgressGetDTO; // at "project-details" component
    ticket_progress?: ProjectTicketProgressGetDTO; // at "project-details" component
}

// When we create a task, we need the relevant projectId, client_id, name, selected leader and all selected engineers
export interface ProjectTaskGetDTO{
    _id: string;
    name: string;
}

/** Needed By Ticket Module */
// When we create a ticket, we need the relevant projectId, name
export interface ProjectTicketGetDTO{
    _id: string;
    name: string;
}

export interface ProjectEngineerGetDTO{
    selectedLeaderID: string;
    selectedEngineersID?: string[];
    //* Retrieved again at frontend
    engineers?: UserGetDTO[];
}

export interface ProjectDashboardDTO {
    _id: string;
    name: string;
    due_date: string;
    completed_date?: string;
    status: string;
    priority: string;
    //* Get at front end
    task_progress?: ProjectTaskProgressGetDTO; // at "project-details" component
    ticket_progress?: ProjectTicketProgressGetDTO; // at "project-details" component
    task_completed_percent?: number;
    hasTask?: boolean;
    ticket_completed_percent?: number;
    hasTicket?: boolean;
}

//? Needed to generate "Monthly Report"
export interface ProjectReportDTO {
    name: string;
    due_date: string;
    status: string;
    priority: string;
    //* "Pending" && "On Hold" project doesn't have `completed_date`
    completed_date?: string;
    task_completed_percent?: number;
    ticket_completed_percent?: number;
}