import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel, UserRegisterDTO} from '../../models/user.model';
import { environment } from '../../../../../environments/environment';

const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json'})};

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) {}

login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_USERS_URL}/user/login`, {
      email,
      password,
    }, httpOptions);
  }

  // CREATE =>  POST: add a new user to the server
  createUser(user: UserRegisterDTO): Observable<any> {
    return this.http.post<any>(`${API_USERS_URL}/user/register`, user);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/user/forgot-password`, { email });
  }

  verifyResetPasswordLink(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${API_USERS_URL}/user/verify-reset-link/${token}`);
  }

  // Reset the user's password
  resetPassword(jwtToken: string, password: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/user/reset-password/${jwtToken}`, { password });
  }

  updateUser(user: any, user_id: string): Observable<any>{
    return this.http.put<any>(`${API_USERS_URL}/user/update/${user_id}`, user);
  }

  getUserByToken(user_id: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${API_USERS_URL}/info/${user_id}`);
  }
}
