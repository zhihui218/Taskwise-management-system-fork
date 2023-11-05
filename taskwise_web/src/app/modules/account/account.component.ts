import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, UserType } from '../auth';
import { Observable, Subscription } from 'rxjs';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit, OnDestroy {
  
  user$: Observable<UserType>;
  ROLE = ROLE;
  private unsubscribe$: Subscription[] = [];

  constructor
  (
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUserSubject.asObservable();
  }

  ngOnDestroy() {
    this.unsubscribe$.forEach((sb) => sb.unsubscribe());
  }
}
