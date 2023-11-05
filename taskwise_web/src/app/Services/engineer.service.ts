import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';


const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})
export class EngineerService {

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

  // This will be used in "Employee Service" to register the employee as Engineer
  async registerEngineer(employee_id: string): Promise<any>{
    return await firstValueFrom(this.http.post<any>(`${API_USERS_URL}/engineer/register/${employee_id}`, httpOptions));
  }

  async getAllEngineer(): Promise<any>{
    this.isLoadingSubject.next(true);

    let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/engineer/getAllEngineer`));

    this.isLoadingSubject.next(false);

    return result;
  }

  async getEngineer(engineer_id: string): Promise<any>{
    this.isLoadingSubject.next(true);

    let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/engineer/findEngineer/${engineer_id}`));
    
    this.isLoadingSubject.next(false);
    return result;
  }
}
