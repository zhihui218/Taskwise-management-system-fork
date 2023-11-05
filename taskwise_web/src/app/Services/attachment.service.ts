import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  firstValueFrom,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttachmentGetDTO } from '../DTOs/AttachmentDTO';

const API_USERS_URL = `${environment.API_URL}`;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private unsubscribe: Subscription[] = [];
  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  // async postAttachment(attachment: AttachmentPostDTO): Promise<boolean> {
  //   try {
  //     const response = await firstValueFrom(
  //       this.http.post(`${API_USERS_URL}/project/createProject`, attachment, httpOptions)
  //     );
  //    this.isLoadingSubject.next(false);
  //     return true;
  //   }catch(error){
  //     this.isLoadingSubject.next(false);
  //     return false;
  //   }
  // }
}
//   async uploadAttachment(
//     id: string,
//     file: File,
//     isProject: boolean
//   ): Promise<void> {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('id', id);
//       formData.append('isProject', isProject.toString());

//       await firstValueFrom(
//         this.http.post(`${API_ATTACHMENT_URL}/upload`, formData)
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   async getAttachmentByProject(projectID: string): Promise<AttachmentGetDTO[]> {
//     try {
//       return await firstValueFrom(
//         this.http.get<AttachmentGetDTO[]>(
//           `${API_ATTACHMENT_URL}/project/${projectID}`
//         )
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   async getAttachmentByTask(taskID: string): Promise<AttachmentGetDTO[]> {
//     try {
//       return await firstValueFrom(
//         this.http.get<AttachmentGetDTO[]>(
//           `${API_ATTACHMENT_URL}/task/${taskID}`
//         )
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   async deleteAttachments(attachmentList: string[]): Promise<void> {
//     try {
//       await firstValueFrom(
//         this.http.post(
//           `${API_ATTACHMENT_URL}/delete`,
//           attachmentList,
//           httpOptions
//         )
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   async deleteAttachmentsByTask(taskID: string): Promise<void> {
//     try {
//       await firstValueFrom(
//         this.http.delete(`${API_ATTACHMENT_URL}/deleteByTask/${taskID}`)
//       );
//     } catch (error) {
//       throw error;
//     }
//   }

//   async deleteAttachmentsByProject(projectID: string): Promise<void> {
//     try {
//       await firstValueFrom(
//         this.http.delete(`${API_ATTACHMENT_URL}/deleteByProject/${projectID}`)
//       );
//     } catch (error) {
//       throw error;
//     }
//   }
// }
