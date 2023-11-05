import { Component, OnInit } from '@angular/core';
import { AuthService, UserType } from 'src/app/modules/auth';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { ROLE } from 'src/app/utils/const';
import { DateFormatter } from 'src/app/utils/DateConverter';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {

  ROLE = ROLE;
  DateFormatter = new DateFormatter();
  user$: Observable<UserType>;
  private unsubscribe: Subscription[] = [];


  constructor(private authService: AuthService) {}

  ngOnInit(): void {this.user$ = this.authService.currentUserSubject.asObservable();

    console.log(this.user$);}

    ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
