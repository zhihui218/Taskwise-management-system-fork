import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { OnlineUser, RealTimeService } from 'src/app/Services/real-time.service';
import { AuthService, UserGetDTO } from 'src/app/modules/auth';

@Component({
  selector: 'app-messenger-drawer',
  templateUrl: './messenger-drawer.component.html',
})
export class MessengerDrawerComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subscription[];
  //? Either "Client" / "Engineer" user (who receive message)
  @Input() contactPerson: UserGetDTO;
  @Input() ticket_id: string;
  isOnline: boolean;
  //? Close the chat box when the "X" icon is clicked
  @Output() closeChat: EventEmitter<void> = new EventEmitter<void>();
  //? To check whether the client / engineer is online
  online_users: OnlineUser[];

  constructor
  (
    private RealTimeService: RealTimeService,
    public AuthService: AuthService,
    private cdr: ChangeDetectorRef, 
    ) 
    { 
      this.unsubscribe$ = [];
    }

  async ngOnInit(): Promise<void> {

    const subscription_3 = this.RealTimeService.online_users.subscribe((online_users: OnlineUser[]) => {
      this.online_users = online_users;
      this.isOnline = this.isRecipientOnline();
      console.log(this.online_users);
      this.cdr.detectChanges();
    })

    const subscription_1 = this.RealTimeService.onUserOnline().subscribe((user_id: string) => {
      console.log(`Online: ${user_id}`);
      if(this.contactPerson && user_id == this.contactPerson._id) this.isOnline = true;
      this.cdr.detectChanges();
    });

    const subscription_2 = this.RealTimeService.onUserOffline().subscribe((user_id: string) => {
      console.log(`Offline: ${user_id}`);
      if(this.contactPerson && user_id == this.contactPerson._id) this.isOnline = false;
      this.cdr.detectChanges();
    });

    this.unsubscribe$.push(subscription_1); this.unsubscribe$.push(subscription_2); this.unsubscribe$.push(subscription_3);
  }

  isRecipientOnline(): boolean{
    return !!this.online_users.find((user: OnlineUser) => user._id == this.contactPerson._id);
  }

  closeChatBox(): void{ this.closeChat.emit(); }

  ngOnDestroy(): void {
    for(const subscription of this.unsubscribe$) subscription.unsubscribe;
  }
}
