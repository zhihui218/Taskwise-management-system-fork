import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatDTO, ChatDeleteDTO, ChatPaginateDTO, ChatUnreadDTO } from '../DTOs/ChatDTO';

const API_USERS_URL = `${environment.API_URL}`;

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  openChat: Observable<boolean>;
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) { 
    this.isLoadingSubject = new BehaviorSubject(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  async retrieveChatHistory(ticket_id: string, page: number, user_id: string): Promise<ChatPaginateDTO | undefined>{
    try{
      this.isLoadingSubject.next(true);

      const chat_history: ChatPaginateDTO = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/chat/retrieve/${ticket_id}/${user_id}?page=${page}`));

      this.isLoadingSubject.next(false);
      
      return chat_history;

    }catch(error){
      console.error(error);
      this.isLoadingSubject.next(false);
      return undefined;
    }
  }

  async retrieveUnreadChats(user_id: string): Promise<ChatUnreadDTO[] | undefined> {
    try{
      const unread_chats: ChatUnreadDTO[] = await firstValueFrom(this.http.get<any>(`${API_USERS_URL}/chat/unreadChat/${user_id}`));

      return unread_chats;

    }catch(error){
      console.error(error);
      return undefined;
    }
  }

  async removeChat(deleteChat: ChatDeleteDTO): Promise<boolean | undefined>{
    try{
      const result = await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/chat/deleteChat`, deleteChat));

      return result;

    }catch(error){
      console.error(error);
      return undefined;
    }
  }

  async markChatAsRead(ticket_id: string, receiver_id: string): Promise<boolean | undefined> {
    try{

      return await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/chat/readChat`, { ticket_id: ticket_id, receiver_id: receiver_id }));

    }catch(error){
      console.error(error);
      return undefined;
    }
  }

  async markAllAsRead(receiver_id: string): Promise<boolean | undefined> {
    try{

      return await firstValueFrom(this.http.put<any>(`${API_USERS_URL}/chat/readAllChat/${receiver_id}`, {}));

    }catch(error){
      console.error(error);
      return undefined;
    }
  }
}
