//? This guard is to make sure the user that access this website is a valid and authorized user
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // 1. Get the current user
    const currentUser = this.authService.currentUserValue;
    // 2. Check whether his / her token is expired
    const isExpired = this.authService.isTokenExpired(this.authService.getAuthFromLocalStorage());
    if (currentUser && !isExpired) {
      return true; //? logged in so return true
    }
    // not logged in so redirect to login page with the return url
    this.authService.logout();
    return false;
  }


}
