import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TicketGetDTO, TicketPostDTO, TicketProjectGetDTO } from '../DTOs/TicketDTO';
import { PaginateGetDTO } from '../DTOs/PaginateGetDTO';
import { AttachmentGetDTO } from '../DTOs/AttachmentDTO';
import { ProjectTicketProgressGetDTO, ProjectTicketProgressTrackerDTO } from '../DTOs/ProgressGetDTO';


const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};


@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private unsubscribe: Subscription[] = [];
  //? Used to update the "task-detail" component when a new ticket is created
  isCreatingTicketSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor
  (
    private http: HttpClient
  ) 
  { 
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  async createTicket(ticket: TicketPostDTO): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(ticket);

      await firstValueFrom(this.http.post<any>(`${API_USERS_URL}/ticket/createTicket`, formData));
      
      this.isLoadingSubject.next(false);
      return true;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async getClientAndEngineerPaginateTicket(user_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getTickets/${user_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  async getTaskPaginateTicket(task_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getTicketsOfTask/${task_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  async getProjectPaginateTicket(project_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getTicketsOfProject/${project_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  //* Accessed when user.role == "MANAGER || ENGINEER"
  async getPaginateTicket(page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getTickets?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }

  }

  async getTicketDetails(ticket_id: string): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const ticket: TicketGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getTicket/${ticket_id}`));

      this.isLoadingSubject.next(false);
      return ticket;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async getProjectTickets(projectId: string): Promise<any>{

    try{

      this.isLoadingSubject.next(true);

      const res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getProjectTickets/${projectId}`));

      const tickets: TicketProjectGetDTO[] = [
        ...res['tickets']
      ];

      this.isLoadingSubject.next(false);
      return tickets;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateTicket(ticket: TicketPostDTO, ticket_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(ticket);
      
      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/ticket/updateTicket/${ticket_id}`, formData));

      const updatedTicket: TicketGetDTO = { ...response }
    
    this.isLoadingSubject.next(false);
    return updatedTicket;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateTicketStatus(ticket_id: string, status: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/ticket/updateStatus/${ticket_id}`, { status: status }, httpOptions));

      const updatedTicket: TicketGetDTO = { ...response };
      
      this.isLoadingSubject.next(false)
      return updatedTicket;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateTicketDueAndEng(ticket_id: string, ticket: any): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/ticket/updateDueAndEng/${ticket_id}`, ticket, httpOptions));
      
      this.isLoadingSubject.next(false)
      return response;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
}

  async deleteTicketAttachment(ticket_id: string, attachmentList: AttachmentGetDTO[]): Promise<any>{
    try{ 
      this.isLoadingSubject.next(true);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/ticket/deleteTicketAttachment/${ticket_id}`, attachmentList, httpOptions));
      
      const updatedTicket: TicketGetDTO = { ...response['ticket'] }
      
      this.isLoadingSubject.next(false);
      return updatedTicket;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async deleteTicket(ticket_id: string): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/ticket/delete/${ticket_id}`));

      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  /** Needed by "Project" Module */

  //* Get the total number of tickets && "Solved" tickets of a specific project
  async getProjectTicketNum(project_id: string): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.get<any>(`${ API_USERS_URL }/ticket/getTicketNum/${ project_id }`));

      const ticketCounts: ProjectTicketProgressTrackerDTO = { ...result };

      this.isLoadingSubject.next(false);
      return ticketCounts;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

    //* Update "Task" engineer list upon "UPDATE" in its project's engineer
  async updateEngineerList(project_id: string, selectedLeaderID: string, selectedEngineersID: string[]){
    try{

      this.isLoadingSubject.next(true);

      const engineerIDList: string[] = selectedEngineersID.concat(selectedLeaderID);
      const result = await firstValueFrom(this.http.put<any>(`${ API_USERS_URL}/ticket/updateEngineer/${ project_id }`, engineerIDList, httpOptions));
      
      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* Delete related tickets of a deleted project
  async deleteProjectTicket(project_id: string): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/ticket/deleteProjectTicket/${project_id}`));

      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

    //* Delete related tickets of a deleted task
    async deleteTaskTicket(task_id: string): Promise<boolean>{
      try{
        this.isLoadingSubject.next(true);
  
        const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/ticket/deleteTaskTicket/${task_id}`));
  
        this.isLoadingSubject.next(false);
        return result;
      }catch(error){
        this.isLoadingSubject.next(false);
        return false;
      }
    }

  //* Calculate the current progress of the project
  async getProjectProgress(project_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/ticket/getProjectProgress/${project_id}`));

      const progress: ProjectTicketProgressGetDTO = { ...result };

      this.isLoadingSubject.next(false);
      return progress;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  // async getPaginateTicket(page: number, limit: number): Promise<any>{

  //   try{
  //     this.isLoadingSubject.next(true);

  //     const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/paginate?page=${page}&limit=${limit}`));

  //     this.isLoadingSubject.next(false);
  //     return paginate;

  //     }catch(error){
  //     this.isLoadingSubject.next(false);
  //     return undefined;
  //   }
  // }

  private BuildFormData(ticket: TicketPostDTO){

    const formData = new FormData();

    formData.append("name", ticket.name);
    formData.append("client_id", ticket.client_id);
    formData.append("project_id", ticket.project_id);
    formData.append("task_id", ticket.task_id);
    if(ticket.completed_date) formData.append("completed_date", ticket.completed_date);
    if(ticket.due_date) formData.append("due_date", ticket.due_date);
    formData.append("status", ticket.status);
    formData.append("priority", ticket.priority);
    formData.append("description", ticket.description);
    formData.append("selectedLeaderID", ticket.selectedLeaderID)
    // Manual / automated assignment happens in engineer / manager sites, not at client site
    // if(ticket.selectedEngineersID){
    //   for(const engineer of ticket.selectedEngineersID) formData.append("selectedEngineersID", engineer);
    // }
    // When there's at least one file uploaded
    if(ticket.attachments.length){
      for(const file of ticket.attachments) formData.append("files", file);
    };

    return formData;
  }
}
