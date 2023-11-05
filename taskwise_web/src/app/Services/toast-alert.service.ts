import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


export interface ToastDTO{
  severity: string;
  summary: string;
  detail: string;
  key?: string;
}

@Injectable({
  providedIn: 'root'
})

//? Whenever we fails / success in invoking the API in doing sth, we display the toast at the <app.component.html>
export class ToastAlertService {
  api_result$: Observable<ToastDTO>
  api_result: Subject<ToastDTO>;

  constructor() {
    this.api_result = new Subject();
    this.api_result$ = this.api_result.asObservable();
  }

  invokeToastAlert(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string, key?: string): void{
    this.api_result.next(this.transformToastDTO(severity, summary, detail, key));
  }

  private transformToastDTO(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string, key?: string){
    const toast: ToastDTO = {
      severity: severity,
      summary: summary,
      detail: detail,
      key: key
    }
    return toast;
  }
}
