import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})

//? HttpInterceptor => For every request, intercept and customize the request
export class JwtInterceptorService implements HttpInterceptor {

  constructor
  (
    private authService: AuthService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Check whether the current access has a valid `jwtToken`
    const jwtToken = this.authService.getAuthFromLocalStorage();

    if(jwtToken){
        // 2. Add "Authorization" as a custom headers in every http request sending to the APIs through `HttpClient`
        /**
         * 3. Hence, when different user roles access the different APIs, they can
         *    3.1: Get the different expected data based on their roles ("MANAGER / ENGINEER / CLIENT")
         *    3.2: Be authorized / unauthorized to access certain endpoints 
         *  */ 
        req = req.clone(
          {
            setHeaders: { Authorization: `Bearer ${jwtToken}` }
          }
        );
      }

      // 4. After intercepting the request header with the `Authorization` token, move on to the next middleware (in case sending the complete request to the endpoint)
      return next.handle(req);
  }
}
