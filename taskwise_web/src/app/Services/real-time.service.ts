import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NotificationGetDTO } from '../DTOs/NotificationDTO';

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
  online_users: BehaviorSubject<OnlineUser[]>;
  online_users$: Observable<OnlineUser[]>;

  constructor() {
    this.online_users = new BehaviorSubject<OnlineUser[]>([]);
    this.online_users$ = this.online_users.asObservable();
    this.socket = io(API_URL);
    //? Broadcast the current online _user
    this.socket.on('onlineUser', (data: OnlineUser[]) => this.online_users.next(data));
  }

  //? Receive the real-time notification to the relevant user who's online
  onNewNotification(): any{
    return new Observable<NotificationGetDTO | undefined>(observer => {
      this.socket.on('notification', (data: NotificationGetDTO | undefined) => { observer.next(data); });
    })
  }

  //? Emit active user to the server
  registerActiveUser(name: string, user_id: string): any{
    this.socket.emit('newUser', { username: name, user_id });
  }
}
