import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_USERS_URL = `${environment.API_URL}`;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

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

  async getNotification(user_id: string, skip: number): Promise<any>{
    try{
      this.isLoadingSubject.next(true);
      const notifications = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/notification/getNotification/${user_id}?skip=${skip}`))
      this.isLoadingSubject.next(false);
      return notifications;
      
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //? When the user first login, load his / her total of unread notification
  async getNumOfUnread(user_id: string): Promise<any>{
    try{
      const numOfUnread = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/notification/getUnreadNotification/${user_id}`))
      return numOfUnread;
      
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async removeUserFromNotification(notification_id: string, user_id: string): Promise<any>{
    try{
      const result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/notification/updateNotification/${notification_id}`, { user_id: user_id }))
      return result;
      
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  //? Mark a notification as read
  async markAsRead(notification_id: string, user_id: string): Promise<any>{
    try{
      const result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/notification/markAsRead/${notification_id}`, { user_id: user_id }))
      return result;
      
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async removeAllNotification(user_id: string): Promise<any>{
    try{
      const result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/notification/removeAllNotification`, { user_id: user_id }))
      return result;
      
    }catch(error){
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

}
