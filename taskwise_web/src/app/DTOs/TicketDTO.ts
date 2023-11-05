import { UserGetDTO } from "../modules/auth";
import { AttachmentGetDTO } from "./AttachmentDTO"

export interface TicketPostDTO{
    name: string,
    client_id: string,
    project_id: string,
    task_id: string,
    completed_date?: string,
    due_date?: string,
    status: string,
    priority: string,
    description: string,
    selectedLeaderID: string;
    // selectedEngineersID?: string[],
    attachments?: File[]
}

export interface TicketGetDTO{
    _id: string,
    name: string,
    client_id: string,
    project_id: string,
    task_id: string,
    created_date: string,
    completed_date?: string,
    due_date?: string,
    status: string,
    priority: string,
    description: string,
    selectedLeaderID: string,
    attachments?: AttachmentGetDTO[],
    //* To retrieve the project's name of the ticket
    project_name?: string;
    task_name?: string;
    selectedLeader: UserGetDTO;
    //* Retrieve client name, profile, email for "Manager && Engineer"
    client?: UserGetDTO;
}

export interface TicketDashboardGetDTO{
    _id: string,
    name: string,
    created_date: string,
    due_date?: string,
    completed_date?: string,
    status: string,
    priority: string,
    selectedLeaderID: string,
    // selectedEngineersID?: string[],
    //* Retrieve the engineers of the ticket (if any)
    // engineers?: UserGetDTO[];
    selectedLeader?: UserGetDTO;
}

//* "Ticket" Object for displaying ticket list of a project
export interface TicketProjectGetDTO{
    _id: string,
    name: string,
    created_date: string,
    status: string,
    description: string,
    client_id: string,
    selectedEngineersID: string[];
    //* Retrieved at Mission-Overview Component
    engineers?: UserGetDTO[];
    client?: UserGetDTO;
}

//? Needed to generate "Monthly Report"
export interface TicketReportDTO {
    name: string;
    created_date: string;
    status: string;
    priority: string;
    selectedLeaderID: string;
    selectedLeader: UserGetDTO;
    client: UserGetDTO;
    //* "Pending" && "Reopened" ticket doesn't have  `completed_date`
    completed_date?: string;
    //* `due_date` appears only when the "Engineer" / "Manager" set it
    due_date?: string;
}
