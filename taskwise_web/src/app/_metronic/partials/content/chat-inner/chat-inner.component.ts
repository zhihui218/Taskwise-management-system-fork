import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatDTO, ChatDeleteDTO, ChatPaginateDTO } from 'src/app/DTOs/ChatDTO';
import { AuthService, UserGetDTO } from 'src/app/modules/auth';
import { ChatService } from 'src/app/Services/chat.service';
import { RealTimeService } from 'src/app/Services/real-time.service';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { ConfirmationService } from 'primeng/api';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-chat-inner',
  templateUrl: './chat-inner.component.html',  
  styleUrls: ['./chat-inner.component.scss'],
  providers: [ConfirmationService]
})

export class ChatInnerComponent implements OnInit {

  DateFormatter: DateFormatter = new DateFormatter();
  @ViewChild("chat_container") chat_container: ElementRef;
  @Input() isDrawer: boolean = false;
  @HostBinding('class') class = 'card-body';
  @HostBinding('id') id = this.isDrawer ? 'kt_drawer_chat_messenger_body' : 'kt_chat_messenger_body';
  isDisableScrollBottom: boolean = false;
  offsetHeight: number = 0;
  //? Chat History
  chat_history: ChatDTO[] = [];
  //? Chat format to be sent
  isLoading$: Observable<boolean>;
  isDeleting: boolean;
  //? Retrieve the chat histories using pagination
  page: number = 1;
  hasPreviousPage: boolean = true;
  message: string = "";
  @Input() contactPerson: UserGetDTO;
  @Input() ticket_id: string;

  constructor(
    private RealTimeService: RealTimeService,
    public AuthService: AuthService,
    private ChatService: ChatService,
    private ConfirmationService: ConfirmationService,
    private ToastService: ToastAlertService,
    private cdr: ChangeDetectorRef) {
    this.isLoading$ = this.ChatService.isLoading$;
  }


  async ngOnInit(): Promise<void> {
    //? Load the chat history
    await this.loadChatHistory();
    //? Allow the user to receive real-time chat from "Client" / "Engineer"
    this.RealTimeService.onMessageReceived().subscribe((message: ChatDTO) => {
      //! Avoid displaying the message if it's sent from other user
      if(message.ticket_id == this.ticket_id){
        this.chat_history.push(message); this.cdr.detectChanges();
        if(this.isDisableScrollBottom) this.chat_container.nativeElement.scrollTop = this.chat_container.nativeElement.scrollHeight;}
        }
      );
  }

  async loadChatHistory(): Promise<void>{
    if(this.hasPreviousPage){
      const chat_history: ChatPaginateDTO | undefined = await this.ChatService.retrieveChatHistory(this.ticket_id, this.page, this.AuthService.currentUserValue._id);
      if(chat_history){
        this.chat_history = [...chat_history.docs, ...this.chat_history];
        this.hasPreviousPage = chat_history.previousPage;
        this.page++;
      }
    }
  }

  async onScroll($event: any): Promise<void>{
    //? Load chat history again when it's scrolled to the "top" of the container
    if(this.chat_container.nativeElement.scrollTop == 0){
      const currentContainerHeight = this.chat_container.nativeElement.scrollHeight;
      await this.loadChatHistory();
      //* Introducing a delay to ensure the container's height has adjusted
      setTimeout(() => {
        this.offsetHeight = this.chat_container.nativeElement.scrollHeight - currentContainerHeight;
        this.isDisableScrollBottom = true; 
        this.cdr.detectChanges();
    });
    }
    //? Detect if the chat has been scrolled to the bottom
    else if($event.target.offsetHeight + $event.target.scrollTop >= $event.target.scrollHeight){
      this.isDisableScrollBottom = false;
      this.cdr.detectChanges();
    }
  }

  scrollToBottom(): void{
    this.chat_container.nativeElement.scrollTo({
      top: this.chat_container.nativeElement.scrollHeight,
      behavior: 'smooth'
    })    
  }
  
  submitMessage(): void {
    if(this.message.trim().length > 0){
      const newChat: ChatDTO = {
        sender_id: this.AuthService.currentUserValue._id,
        receiver_id: this.contactPerson._id,
        ticket_id: this.ticket_id,
        message: this.message,
      }
      this.RealTimeService.sendMessage(newChat);
      newChat.createdAt = new Date().toISOString();
      this.chat_history.push(newChat);
      //? Move the the bottom of chat when a message is sent
      this.isDisableScrollBottom = false;
      //? Reset the message textarea
      this.message = "";
    }
  }

  getMessageCssClass(message: ChatDTO): string {
    return `p-5 rounded text-dark fw-bold mw-lg-400px bg-light-${
      message.sender_id !== this.AuthService.currentUserValue._id ? 'info' : 'primary'
    } text-${message.sender_id !== this.AuthService.currentUserValue._id ? 'start' : 'end'}`;
  }

  
  async openConfirmationDialog(): Promise<void> {
    this.ConfirmationService.confirm({
      message: 'Are you sure that you want to delete the chats?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        this.isDeleting = true;

        const deleteChat: ChatDeleteDTO = {
          user_id: this.AuthService.currentUserValue._id,
          receiver_id: this.contactPerson._id,
          ticket_id: this.ticket_id,
        }
        const result = await this.ChatService.removeChat(deleteChat);

        if(result){ this.chat_history = []; this.hasPreviousPage = false; }
        else{
          this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!');
        }

        this.isDeleting = false;
        this.cdr.detectChanges();
      },
      reject: () => {}
    })
  }
}
