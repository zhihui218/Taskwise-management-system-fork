import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ChatUnreadDTO } from 'src/app/DTOs/ChatDTO';
import { ChatService } from 'src/app/Services/chat.service';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-chat-history',
  templateUrl: './chat-history.component.html',
  styleUrls: ['./chat-history.component.scss']
})
export class ChatHistoryComponent implements OnInit {

  isLoading: boolean;
  unread_chat_list: ChatUnreadDTO[];
  @Output() closePanel: EventEmitter<void> = new EventEmitter<void>();
  @Output() hasUnreadChat: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public AuthService: AuthService, 
    private ChatService: ChatService,
    private router: Router, 
    private cdr: ChangeDetectorRef){}

  async ngOnInit(): Promise<void> {
    await this.loadChat();
  }

  async loadChat(): Promise<void> {
    this.isLoading = true;
    this.unread_chat_list = await this.ChatService.retrieveUnreadChats(this.AuthService.currentUserValue._id);
    this.checkUnreadChat();
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  navigateToDetails(index: number){
    this.router.navigate(['crafted/pages/profile/tickets', this.unread_chat_list[index].ticket_id]);
  }

  async markAllUnreadChatAsRead(): Promise<void>{
    if(this.unread_chat_list?.length > 0){
      const result = await this.ChatService.markAllAsRead(this.AuthService.currentUserValue._id);
      if(result) this.unread_chat_list = [];
      this.checkUnreadChat();
    }
  }

  checkUnreadChat(): void{
    if(this.unread_chat_list?.length > 0) this.hasUnreadChat.emit(true);
    else this.hasUnreadChat.emit(false);
  }

}
