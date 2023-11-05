import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  firstValueFrom,
  map,
  switchMap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmployeeGetDTO, EmployeePostDTO, EmployeePutDTO } from '../DTOs/EmployeeDTO';
import { EngineerService } from './engineer.service';
import { EngineerGetDTO } from '../DTOs/EngineerDTO';
import { Utils } from '../utils/FileConverter';

const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class EmployeeService implements OnDestroy {
  private unsubscribe: Subscription[] = [];
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private engineerService: EngineerService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  async registerEmployee(employee: EmployeePostDTO): Promise<boolean> {
    try {
      this.isLoadingSubject.next(true);
      let result = await firstValueFrom(
        this.http.post<any>(`${API_USERS_URL}/register`, employee, httpOptions)
      );

      if (result['status'])
        result = await this.engineerService.registerEngineer(
          result['employeeID']
        );

      this.isLoadingSubject.next(false);
      return true;
    } catch (error) {
      this.isLoadingSubject.next(false);
      return false;
    }
  }

  async getEmployeeInfo(employee_id: string): Promise<EmployeeGetDTO | undefined> {
    try{
      this.isLoadingSubject.next(true);
      let result = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/info/${employee_id}`));

      let employee: EmployeeGetDTO = {
        name: result['name'],
        phone: result['phone'],
        profile: Utils.BuffertoBase64Encode(result['profile']['data'])
      }

      this.isLoadingSubject.next(false);
      return employee;

    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
    

    // return await firstValueFrom(
    //   this.http.get<any>(`${API_USERS_URL}/info/${employee_id}`).pipe(
    //     map((data: any) => {
    //       // Convert the Buffer[] data type of profile to Base64EncodeUrl to be displayed
    //       let employee: EmployeeGetDTO = {
    //         name: data['name'],
    //         phone: data['phone'],
    //         profile: Utils.BuffertoBase64Encode(data['profile']['data']),
    //       };
    //       return employee;
    //     })
    //   )
    // );
  }

  // Get the details of ALL "Engineers" to create a PROJECT
  async getEmployeesByEngineer(): Promise<EngineerGetDTO[] | undefined> {
    try {
      this.isLoadingSubject.next(true);
      let result = await this.engineerService.getAllEngineer();
      if (result['status']) {
        let allEngineers: EngineerGetDTO[] = [];

        // Fetch the details of each "Engineer" from the "Employee" collection
        for(const engineer of result['engineers']){
          let employee: EmployeeGetDTO | undefined = await this.getEmployeeInfo(engineer['employeeID']);
          if(employee){
            let currentEngineer: EngineerGetDTO = {
              engineerId: engineer['_id'],
              ...employee
            };
            allEngineers.push(currentEngineer);
          }
        }

        this.isLoadingSubject.next(false);
        return allEngineers;
      }
    } catch (error) {
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async getEmployeeByEngineerId(engineerId: string): Promise<EngineerGetDTO | undefined> {
    try {
      this.isLoadingSubject.next(true);
  
      const engineerResult = await this.engineerService.getEngineer(engineerId);

      // Ensure that the result contains employeeId before proceeding
      if (engineerResult['status']) {
        const employeeId = engineerResult['engineer']['employeeID'];
        const employee = await this.getEmployeeInfo(employeeId);

        if(employee){
          // Merge the employee information with the engineer information
        const engineer: EngineerGetDTO = {
          engineerId: engineerId,
          ...employee
        };
        this.isLoadingSubject.next(false);
        return engineer;
        }
      } else {
        console.error('Employee ID not found in the result from engineerService');
      }
    } catch (error) {
      console.error(error);
    }
    this.isLoadingSubject.next(false);
    return undefined;
  }

  async updateEmployee(employee: EmployeePutDTO, employee_id: string): Promise<any>{
    try{
      this.isLoadingSubject.next(true);

      let result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/update/${employee_id}`, employee, httpOptions));

      this.isLoadingSubject.next(false);
      return result;
    }catch(error){
      this.isLoadingSubject.next(false);
      return false;
    }
  }
  
  
  // Get the details of ALL "Engineers" to create a PROJECT
  // async getEmployeesOfProject(employee_ids: string[]): Promise<EngineerGetDTO[] | undefined>{
  //   try{
  //     this.isLoadingSubject.next(true);

  //     let engineers: EngineerGetDTO[] =

  //     // Fetch the details of each "Engineer" from the "Employee" collection
  //     employee_ids.forEach(async (employee_id: any) => {
  //       let employee: EmployeeGetDTO = await this.getEmployeeInfo(employee_id);
  //       let currentEngineer: EngineerGetDTO = {
  //         engineerId: engineer['_id'],
  //         name: employee['name'],
  //         phone: employee['phone'],
  //         profile: employee['profile'],
  //       }
  //       allEngineers.push(currentEngineer);
  //     })

  //     this.isLoadingSubject.next(false);
  //     return allEngineers;

  //   }catch(error){
  //     this.isLoadingSubject.next(false);
  //     return undefined;
  //   }
  // }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe);
  }
}
