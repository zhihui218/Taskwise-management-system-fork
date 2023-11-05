import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, catchError, first, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TaskGetDTO, TaskPostDTO, TaskProjectGetDTO } from '../DTOs/TaskDTO';
import { AttachmentGetDTO } from '../DTOs/AttachmentDTO';
import { PaginateGetDTO } from '../DTOs/PaginateGetDTO';
import { ProjectTaskProgressGetDTO } from '../DTOs/ProgressGetDTO';
import { DateFormatter } from '../utils/DateConverter';


const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};


@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private unsubscribe: Subscription[] = []
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;
  DateFormatter = new DateFormatter();

  constructor
  (
    private http: HttpClient
  ) 
  { 
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  async createTask(task: TaskPostDTO): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(task);

      const result = await firstValueFrom(this.http.post<any>(`${API_USERS_URL}/task/createTask`, formData));
      this.isLoadingSubject.next(false);
      return true;
    }catch(error){
      console.log(error);
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async getAllTask(): Promise<any>{
    try{
      this.isLoadingSubject.next(true);
      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/allTasks`));
      let taskList: TaskGetDTO[] = [];

      for(const task of result['tasks']){
        taskList.push(task);
      }

      this.isLoadingSubject.next(false);
      return taskList;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* user.role == "MANAGER"
  async getPaginateTask(page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);
      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/paginate?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  //* user.role == "ENGINEER"
  async getEngineerPaginateTask(user_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);
      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/paginate/${user_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  //* user.role == "CLIENT"
  async getProjectPaginateTask(project_id: string, page: number, limit: number): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/taskOfProjectPaginate/${project_id}?page=${page}&limit=${limit}`));

      this.isLoadingSubject.next(false);
      return paginate;

      }catch(error){
        this.isLoadingSubject.next(false);
        return undefined;
    }
  }

  async getProjectTasks(projectId: string): Promise<any>{

    try{

      this.isLoadingSubject.next(true);

      const res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/getProjectTasks/${projectId}`));
      const tasks: TaskProjectGetDTO[] = [
        ...res['tasks']
      ];

      this.isLoadingSubject.next(false);
      return tasks;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateTask(task: TaskPostDTO, task_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const formData = this.BuildFormData(task);
      
      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/task/updateTask/${task_id}`, formData));
      
      this.isLoadingSubject.next(false);
      return this.taskStructureTransform(response);
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateTaskStatus(task_id: string, status: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/task/updateStatus/${task_id}`, { status: status }, httpOptions));
      
      this.isLoadingSubject.next(false)
      return this.taskStructureTransform(result);
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async deleteTaskAttachment(task_id: string, attachmentList: AttachmentGetDTO[]): Promise<any>{
    try{ 
      this.isLoadingSubject.next(true);

      let response = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/task/deleteTaskAttachment/${task_id}`, attachmentList, httpOptions));
      
      const updatedTask: TaskGetDTO = { ...response['task'] }
      
      this.isLoadingSubject.next(false);
      return updatedTask;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async deleteTask(task_id: string): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/task/delete/${task_id}`));

      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async getTaskDetails(task_id: string): Promise<TaskGetDTO | undefined>{
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/getTask/${task_id}`));

      this.isLoadingSubject.next(false);
      return this.taskStructureTransform(result);
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }


  // // After deleting a project, we need to delete all its task
  // async deleteProjectTask(project_id: string): Promise<boolean>{
  //   try{
  //     this.isLoadingSubject.next(true);

  //     await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/task/deleteProjectTask/?projectId=${project_id}`));

  //     this.isLoadingSubject.next(false);
  //     return true;
  //   }catch(error){
  //     this.isLoadingSubject.next(false);
  //     return false;
  //   }
  // }

  /** Needed by "Project" Module */

  //* Get the total number of tasks && "Completed" tasks of a specific project
  async getProjectTaskNum(project_id: string): Promise<any>{

    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.get<any>(`${ API_USERS_URL }/task/getTaskNum/${ project_id }`));

      const taskCounts: ProjectTaskProgressGetDTO = { ...result }

      this.isLoadingSubject.next(false);
      return taskCounts;
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
      const result = await firstValueFrom(this.http.put<any>(`${ API_USERS_URL}/task/updateEngineer/${ project_id }`, engineerIDList, httpOptions));
      
      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* Delete related tasks of a deleted project
  async deleteProjectTask(project_id: string): Promise<boolean>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.delete<any>(`${API_USERS_URL}/task/deleteProjectTask/${project_id}`));

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

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/getProjectProgress/${project_id}`));

      const progress: ProjectTaskProgressGetDTO = { ...result };

      this.isLoadingSubject.next(false);
      return progress;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //! For "Task Distribution" analysis in dashboard
  async getTasksDistribution(): Promise<any>{
    try{

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/task/taskAnalysis`));

      const yearResult = result['yearResult'];

      const currentMonthResult = result['currentMonthResult'];

      const currentWeekResult = result['currentWeekResult']

      return { yearResult, currentMonthResult, currentWeekResult };

    }catch(error){
      return undefined;
    }
  }

  private BuildFormData(task: any){

    const formData = new FormData();

    formData.append("name", task.name);
    formData.append("due_date", task.due_date);
    formData.append("estimatedCompletedHour", `${ this.DateFormatter.transformToHours(task.day, task.hour, task.minute) }`);
    formData.append("status", task.status);
    formData.append("priority", task.priority);
    formData.append("description", task.description);
    formData.append("projectID", task.projectID);
    formData.append("selectedLeaderID", task.selectedLeaderID);
    // When there's at least one team member selected
    if(task.selectedEngineersID.length){
      for(const engineer of task.selectedEngineersID) formData.append("selectedEngineersID", engineer);
    };    // When there's at least one file uploaded
    if(task.attachments.length){
      for(const file of task.attachments) formData.append("files", file);
    };

    return formData;
  }

  //? Always transform the task to TaskGetDTO
  private taskStructureTransform(result: any){
    const { estimatedCompletedHour, ...task } = result;
    const { day, hour, minute } = this.DateFormatter.transformToDayAndHourAndMinute(estimatedCompletedHour);

    const taskDetail: TaskGetDTO = {
      ...task,
      day: day,
      hour: hour,
      minute: minute
    }

    return taskDetail;
  }
}
