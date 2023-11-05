import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, catchError, finalize, first, firstValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProjectEngineerGetDTO, ProjectGetDTO, ProjectPostDTO, ProjectTaskGetDTO, ProjectTicketGetDTO } from '../DTOs/ProjectDTO';
import { AttachmentGetDTO } from '../DTOs/AttachmentDTO';
import { PaginateGetDTO } from '../DTOs/PaginateGetDTO';


const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders()};

@Injectable({
  providedIn: 'root'
})
export class ProjectService implements OnDestroy{

  private unsubscribe: Subscription[] = []
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

  async createProject(project: ProjectPostDTO): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(project);

      await firstValueFrom(this.http.post<any>(`${API_USERS_URL}/project/createProject`, formData));
      
      this.isLoadingSubject.next(false);
      return true;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async getClientAndEngineerPaginateProject(user_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/paginate/${user_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  async managerViewClientProject(user_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/viewClientProject/${user_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  async getPaginateProject(page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/paginate?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }
  
  async getAllProjects(): Promise<any>{
    try{
      this.isLoadingSubject.next(true);
      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/allProjects`));
      let projects: ProjectGetDTO[] = [];

      for(const project of result['projects']){
        //! To Be Updated
        project.tasks = [];
        project.progress = 0;
        projects.push(project);
      }

      this.isLoadingSubject.next(false);

      return projects;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateProjectStatus(project_id: string, status: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/project/updateStatus/${project_id}`, { status: status }, httpOptions));
      
      this.isLoadingSubject.next(false)
      return response;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async updateProject(project: ProjectPostDTO, project_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(project);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/project/updateProject/${project_id}`, formData));

      const updatedProject: ProjectGetDTO = { ...response['project'] }
      
      this.isLoadingSubject.next(false);
      return updatedProject;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async deleteProjectAttachment(project_id: string, attachmentList: AttachmentGetDTO[]): Promise<any>{
    try{ 
      this.isLoadingSubject.next(true);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/project/deleteProjectAttachment/${project_id}`, attachmentList, httpOptions));
      
      const updatedProject: ProjectGetDTO = { ...response['project'] }
      
      this.isLoadingSubject.next(false);
      return updatedProject;

    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async deleteProject(project_id: string): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/project/delete/${project_id}`));

      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  // Retrieve all the projects to be selected while creating a task
  async getProjectsForTask(): Promise<any> {
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/projectsForTask`));
      
      let projects: ProjectTaskGetDTO[] = [];

      for(const project of result['projects']){
        projects.push(project);
      }

      this.isLoadingSubject.next(false);
      return projects;

    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* Get all the information of the project itself
  async getProjectDetails(project_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/getProject/${project_id}`));

      const project: ProjectGetDTO = { ...result['project'] };

      this.isLoadingSubject.next(false);
      return project;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async getProjectOfTask(project_id: string){
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/getProjectOfTask/${project_id}`));

      const projectInfo: ProjectTaskGetDTO = {
        _id: project_id,
        ...result['project']
      }

      this.isLoadingSubject.next(false);
      return projectInfo;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async getProjectsOfClient(client_id: string){
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/getProjectsOfClient/${client_id}`));

      let projectInfo: ProjectTicketGetDTO[] = result["projects"];

      this.isLoadingSubject.next(false);
      return projectInfo;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }
  
  /* Needed By Ticket Module*/
  async getProjectNameAndLeader(project_id: string): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/getNameAndLeader/${project_id}`));

      const { name } = res;
      
      this.isLoadingSubject.next(false);
      return { name };
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* Get the project's engineers to choose assignees for a ticket
  async getProjectEngineers(project_id: string): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/getEngineers/${project_id}`));

      const projectEngineer: ProjectEngineerGetDTO = { ...res };
      
      this.isLoadingSubject.next(false);
      return projectEngineer;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //! For "Task Distribution" analysis in dashboard
  async getProjectDistribution(): Promise<any>{
    try{

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/project/projectAnalysis`));

      const yearResult = result['yearResult'];

      const currentMonthResult = result['currentMonthResult'];

      const currentWeekResult = result['currentWeekResult']

      return { yearResult, currentMonthResult, currentWeekResult };

    }catch(error){
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  private BuildFormData(project: ProjectPostDTO){

    const formData = new FormData();

    formData.append("name", project.name);
    formData.append("type", project.type);
    formData.append("client_id", project.client_id);
    formData.append("due_date", project.due_date);
    formData.append("status", project.status);
    formData.append("priority", project.priority);
    formData.append("description", project.description);
    // formData.append("selectedLeaderID", project.selectedLeaderID);
    // // When there's at least one team member selected
    // if(project.selectedEngineersID.length){
    //   for(const engineer of project.selectedEngineersID) formData.append("selectedEngineersID", engineer);
    // };
    // When there's at least one file uploaded
    if(project.attachments.length){
      for(const file of project.attachments) formData.append("files", file);
    };

    return formData;
  }
}
