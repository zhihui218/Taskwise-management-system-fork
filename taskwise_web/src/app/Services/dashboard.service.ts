import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, catchError, finalize, first, firstValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginateGetDTO } from '../DTOs/PaginateGetDTO';
import { ProjectDashboardDTO, ProjectReportDTO } from '../DTOs/ProjectDTO';
import { TicketReportDTO } from '../DTOs/TicketDTO';
import { TaskReportDTO } from '../DTOs/TaskDTO';

const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders()};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  isLoading$_1: Observable<boolean>; isLoadingSubject_1: BehaviorSubject<boolean>;
  isLoading$_2: Observable<boolean>; isLoadingSubject_2: BehaviorSubject<boolean>;

  isLoadingPdf$:Observable<boolean>; isLoadingPdfSubject: BehaviorSubject<boolean>;


  constructor(private http: HttpClient) 
  { 
    this.isLoadingSubject_1 = new BehaviorSubject<boolean>(false); this.isLoading$_1 = this.isLoadingSubject_1.asObservable();
    this.isLoadingSubject_2 = new BehaviorSubject<boolean>(false); this.isLoading$_2 = this.isLoadingSubject_2.asObservable();

    this.isLoadingPdfSubject = new BehaviorSubject<boolean>(false); this.isLoadingPdf$ = this.isLoadingPdfSubject.asObservable();
  }

  //? For "First-Card" of Dashboard
  async countOverall(): Promise<any>{
    try{

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/countAll`));

      const projects = result['projects'];

      const tasks = result['tasks'];

      const tickets = result['tickets'];

      return { projects, tasks, tickets };

    }catch(error){
      return undefined;
    }
  }

  //? For "Second-Card" of Dashboard
  async countClientAndEngineer(): Promise<any>{
    try{

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/countClientAndEngineer`));

      const numOfClient = result['numOfClient'];

      const numOfEngineer = result['numOfEngineer'];

      return { numOfClient, numOfEngineer };

    }catch(error){
      return undefined;
    }
  }

  async getWeeklyWorkload(user_id: string): Promise<any> {
    try{
      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/workload/${user_id}`));

      return result;
    }catch(error){
      return undefined;
    }
  }

  //? Paginate "Engineer" || "Client"
  async getPaginateUser(user_role: string, page: number, limit: number): Promise<any>{

    try{

      const paginate: PaginateGetDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/paginateUser/${user_role}?page=${page}&limit=${limit}`));

      return paginate;

      }catch(error){
        return undefined;
    }
  }

    //? For "Line Graph" of "Task Distribution"
    async getTasksDistribution(): Promise<any>{
      try{
        this.isLoadingSubject_1.next(true);
  
        const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/taskAnalysis`));
  
        const yearResult = result['yearResult'];
  
        const currentMonthResult = result['currentMonthResult'];
  
        const currentWeekResult = result['currentWeekResult']
  
        this.isLoadingSubject_1.next(false);
        return { yearResult, currentMonthResult, currentWeekResult };
  
      }catch(error){
        this.isLoadingSubject_1.next(false);
        return undefined;
      }
    }

  //? For "Pie Chart" of "Project Status" && "Ticket Status"
  async getPieDistribution(model_type: string): Promise<any>{
    try{
      this.isLoadingSubject_2.next(true);

      const result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/dashboard/pieAnalysis/${model_type}`));

      const yearResult = result['yearResult'];

      const currentMonthResult = result['currentMonthResult'];

      const currentWeekResult = result['currentWeekResult'];

      this.isLoadingSubject_2.next(false);
      return { yearResult, currentMonthResult, currentWeekResult };

    }catch(error){
      this.isLoadingSubject_2.next(false);
      return undefined;
    }
  }

  isGeneratingPdf(cond: boolean): void{
    this.isLoadingPdfSubject.next(cond);
  }

  //? Retrieve all the necessary information of "This Month" task, project, ticket for generating the "Monthly Report"
  async getAll(model_type: string): Promise<any>{
    try{
      const result = await firstValueFrom(this.http.get(`${API_USERS_URL}/dashboard/getAll/${model_type}`));

      const model_list: ProjectReportDTO[] | TaskReportDTO[] | TicketReportDTO[] = [];

      for(const model of result as any[]) model_list.push({ ...model } );

      return result;
    }catch(error){
      return undefined;
    }
  }

}
