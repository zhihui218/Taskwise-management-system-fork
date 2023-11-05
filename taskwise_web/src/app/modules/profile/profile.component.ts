import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, UserType } from '../auth';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {

  user$: Observable<UserType>;
  private unsubscribe$: Subscription[] = [];

  constructor
  (
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$ = this.authService.currentUserSubject.asObservable();
  }

  ngOnDestroy() {
    this.unsubscribe$.forEach((sb) => sb.unsubscribe());
  }
}
