//? This guard is to make sure the authorized user can only access certain web page based on his/her ROLE
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
    const expectedRole: String[] = route.data.accessRole;
    if(expectedRole.includes(this.authService.currentUserValue.role)) return true;
    else{ this.router.navigate(['/error/401']); return false; }
  }
}
