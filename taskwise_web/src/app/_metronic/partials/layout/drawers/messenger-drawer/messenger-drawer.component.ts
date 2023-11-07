import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
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
  online_users: [];

  constructor
  (
    public AuthService: AuthService,
    private cdr: ChangeDetectorRef, 
    ) 
    { 
      this.unsubscribe$ = [];
    }

  async ngOnInit(): Promise<void> {

  }

  closeChatBox(): void{ this.closeChat.emit(); }

  ngOnDestroy(): void {
    for(const subscription of this.unsubscribe$) subscription.unsubscribe;
  }
}
