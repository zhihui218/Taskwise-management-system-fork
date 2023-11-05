import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription, firstValueFrom } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel, UserInfoPostDTO, UserPasswordPostDTO, isUserInfoPostDTO, isUserPasswordPostDTO, UserRegisterDTO, engineerDetailDTO } from '../models/user.model';
import { Router } from '@angular/router';
import { AuthHTTPService } from './auth-http/auth-http.service';
import { ROLE } from 'src/app/utils/const';

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `jwtToken`;
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  isClient(): boolean { return this.currentUserValue.role == ROLE.CLIENT };

  isEngineer(): boolean { return this.currentUserValue.role == ROLE.ENGINEER };

  isManager(): boolean { return this.currentUserValue.role == ROLE.MANAGER };

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(email: string, password: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((response: any) => {
        //* Store the jwttoken of the current user
        const result = this.setAuthFromLocalStorage(response['token']);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  updateUser(user: UserInfoPostDTO | UserPasswordPostDTO, user_id: string): Observable<any>{
    this.isLoadingSubject.next(true);
    const formData = this.BuildFormData(user);
    return this.authHttpService.updateUser(formData, user_id).pipe(
      map((res: any) => {
        const result = this.setAuthFromLocalStorage(res['token']);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    )
  }

  //? Necessary information to do performance prediction
  updateEngineerDetails(engineer: engineerDetailDTO, user_id: string): Observable<any>{
    return this.authHttpService.updateUser(engineer, user_id).pipe(
      map((res: any) => {
        const result = this.setAuthFromLocalStorage(res['token']);
        return result;
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
    )
  }

  getUserByToken(): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    const jwtDecode = JSON.parse(atob(auth.split('.')[1]));

    // Get the information of current user
    const user: UserModel = {
      ...jwtDecode['user']
    }

    // Parse the "user" as subject
    this.currentUserSubject.next(user);
    this.isLoadingSubject.next(false);

    return of(true);
  }

  // Create a new user
  registration(user: UserRegisterDTO): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map((res: any) => {
        return res['status'];
      }),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  //? Get the "Reset Password Link"
  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  //? Whenever the user click the "Reset Password Link", verify whether the link is valid, if yes, navigate to "resetPassword" else display error message
  verifyResetPasswordLink(token: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .verifyResetPasswordLink(token)
      .pipe(finalize(() => this.isLoadingSubject.next(false)))
  }

  //? Reset the user's password
  resetPassword(jwtToken: string, password: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .resetPassword(jwtToken, password)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  private setAuthFromLocalStorage(jwtToken: any): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (jwtToken != undefined) {
      localStorage.setItem(this.authLocalStorageToken, jwtToken);
      return true;
    }
    return false;
  }

  getAuthFromLocalStorage(): string | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) return undefined;
      // jwtToken here
      return lsValue;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  isTokenExpired(token: string): boolean {
    if(token){
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    }
    return true;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  private BuildFormData(user: UserPasswordPostDTO | UserInfoPostDTO){

    const formData = new FormData();

    if(isUserInfoPostDTO(user)){
      formData.append("name", user.name);
      formData.append("file", user.profile);
      formData.append("phone", user.phone);
    }

    if(isUserPasswordPostDTO(user)){
      formData.append("password", user.password);
    }

    //? User `firstLogin` == false after the update
    formData.append("firstLogin", 'false');

    return formData;
  }
}
