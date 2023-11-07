import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})

export class TopbarComponent implements OnInit, OnDestroy {

  ROLE = ROLE;
  DateFormatter = new DateFormatter();
  private unsubscribe$: Subscription[];
  hasUnreadChat: boolean;
  //? To check whether there is older list of notification
  hasNextPage: boolean;
  @ViewChild("op") op: any;
  //? Hide the overlay panel of notification when the window is scrolled
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
  if(this.op) this.op.hide();
}

  constructor(
    public AuthService: AuthService,
    ){ 
    }

  async ngOnInit(): Promise<void> {
  }

  ngOnDestroy(): void {
    for(const subscription of this.unsubscribe$) subscription.unsubscribe;
  }
}
