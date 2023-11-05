import { Injectable } from '@angular/core';
import { Observable, Observer, fromEvent, map, merge } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkConnectionService {

  constructor() { }
  /**
   * 1. fromEvent(window, 'offline')
   *  a. Create an Observable that listen to the 'offline' event on the `window` object (Fires when browser lost connection)
   *  b. Hence, emits "false";
   * 2. fromEvent(window, 'online')
   *  a. Create an Observable that listen to the 'online' event on the `window` object (Fires when browser has connection / re-established)
   *  b. Hence, emits "true"
   * 3. new Observable((sub: Observer<boolean>) => {})
   *  a. Immediately emit the online / offline status of the browser when someone subscribe to it
   * 4. `merge()` will combine the results from the 3 Observable and return to the users
   */
  checkConnection(){
      return merge(
        fromEvent(window, 'offline').pipe(map(() => false)),
        fromEvent(window, 'online').pipe(map(() => true)),
        new Observable((sub: Observer<boolean>) => {
          sub.next(navigator.onLine);
          sub.complete();
        }));
    }
  }
