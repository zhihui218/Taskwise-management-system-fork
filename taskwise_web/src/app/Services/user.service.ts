import { APP_INITIALIZER, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EngineerRemarkAndKPI, UserGetDTO, engineerDetailDTO } from '../modules/auth';

const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient
  ) 
  { 
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  //* Retrieve all the users with user.role === "ENGINEER"
  async getEngineers(): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/user/getEngineers`));

      let engineerList: UserGetDTO[] = [];

      for(const element of res['engineers']){
        let engineer: UserGetDTO = {
          ...element
        }
        engineerList.push(engineer); 
      }

      this.isLoadingSubject.next(false);
      return engineerList;

    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //* Check whether a user is online
  async checkUserStatus(user_id: string): Promise<any>{
    try{
      const res: boolean | undefined = (await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/user/status/${user_id}`)))['isOnline'];
      return res;
    }catch(error){
      return undefined;
    }
  }

  //* Retrieve all the users with user.role === "CLIENT"
  async getClients(): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let res = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/user/getClients`));

      let clientList: UserGetDTO[] = [];

      for(const element of res['clients']){
        let client: UserGetDTO = {
          ...element
        }
        clientList.push(client); 
      }

      this.isLoadingSubject.next(false);
      return clientList;

    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async getUserById(_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.get(`${API_USERS_URL}/user/getUser/${_id}`));

      const user: UserGetDTO = { ...result['user'] };

      this.isLoadingSubject.next(false);
      return user;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async updateEngineerByManager(engineer_id: string, details: engineerDetailDTO): Promise<any>{
    try{
      const result = await firstValueFrom(this.http.put<any>(`${ API_USERS_URL}/user/updateEngineer/${ engineer_id } `, details));
      return result;
    }catch(error){
      return undefined;
    }
  }

  async getEngineerRemarkAndKPI(engineer_id: string): Promise<EngineerRemarkAndKPI | undefined>{
    try{
      this.isLoadingSubject.next(true);

      const result = await firstValueFrom(this.http.get<any>(`${ API_USERS_URL}/user/remarkAndKpi/${ engineer_id }`));

      const remarkAndKpi: EngineerRemarkAndKPI = { ...result };

      this.isLoadingSubject.next(false);
      return remarkAndKpi;
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
