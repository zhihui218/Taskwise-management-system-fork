import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationGetDTO } from '../DTOs/NotificationDTO';
import { ChatDTO, ChatPostDTO, ChatUnreadDTO } from '../DTOs/ChatDTO';

const API_URL = environment.API_URL;

export type OnlineUser = {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})

export class RealTimeService {
  private socket;
  observable: Observable<string>;
  // Create a BehaviorSubject to store the online users
  // private onlineUsersSubject = new BehaviorSubject<OnlineUser[]>([]);
  // // Expose an observable to listen to changes in the online users
  // onlineUsers$: Observable<OnlineUser[]>;
  online_users: BehaviorSubject<OnlineUser[]> = new BehaviorSubject<OnlineUser[]>([]);

  constructor() {
    this.socket = io(API_URL);
    //? Broadcast the current online _user
    // this.onlineUsersSubject = new BehaviorSubject<OnlineUser[]>([]);
    // this.onlineUsers$ = this.onlineUsersSubject.asObservable();
    this.socket.on('onlineUser', (data: OnlineUser[]) => this.online_users.next(data));
  }

  // onUserStatusChange(): any{
  //   this.socket.on('onlineUser', (data: OnlineUser[]) => {
  //     // Update the online users in the BehaviorSubject
  //     this.onlineUsersSubject.next(data);
  //   });
  // }

  //? Receive the real-time notification to the relevant user who's online
  onNewNotification(): any{
    return new Observable<NotificationGetDTO | undefined>(observer => {
      this.socket.on('notification', (data: NotificationGetDTO | undefined) => { observer.next(data); });
    })
  }

  //? Receive real-time message once the message is sent from the sender
  onMessageReceived(): any{
    return new Observable<ChatDTO | undefined>(observer => {
      this.socket.on("receiveMessage", (data: ChatDTO | undefined) => { observer.next(data); });
    })
  }

  //? Invoked when the user is online && not in any chat, but receive a chat
  onNewChatHistory(): any{
    return new Observable<ChatUnreadDTO | undefined>(observer => {
      this.socket.on('chatHistory', (data: ChatUnreadDTO | undefined) => { observer.next(data); });
    })
  }

  //? Receive real-time chat that is read to be removed from the `chat-history`
  onMessageRead(): any{
    return new Observable<string | undefined>(observer => {
      this.socket.on("removeChat", (data: string | undefined) => { observer.next(data); });
    })
  }

  //? Mark online status when the user is online (Pass `user._id` back)
  onUserOnline(): any{
    return new Observable<string>(observer => {
      this.socket.on('userOnline', (data: string) => { observer.next(data); })
    })
  }

  //? Dismiss online status when the user is offline (Pass `user._id` back)
  onUserOffline(): any{
    return new Observable<string>(observer => {
      this.socket.on('userOffline', (data: string) => { observer.next(data); })
    })
  }

  //? Emit active user to the server
  registerActiveUser(name: string, user_id: string): any{
    this.socket.emit('newUser', { username: name, user_id });
  }

  //? Emit the message to the server
  sendMessage(newMessage: ChatPostDTO): void {
    this.socket.emit('sendMessage', 
    { 
      message: newMessage.message, 
      to: newMessage.receiver_id, 
      from: newMessage.sender_id, 
      ticket_id: newMessage.ticket_id
    });
  }

  //? Emit when the user is in a chat room (open chat in a ticket)
  enterChatRoom(user_id: string, ticket_id: string): void{
    this.socket.emit('enterChat',
    {
      user_id: user_id,
      ticket_id: ticket_id
    })
  }

  //? Emit when the user leave the chat room (disconnect / close a specific chat in the ticket)
  leaveChatRoom(user_id: string): void{
    this.socket.emit('leaveChat',
    {
      user_id: user_id
    })
  }
}
