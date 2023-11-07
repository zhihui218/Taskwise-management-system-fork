import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslationService } from './modules/i18n';
// language list
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as jpLang } from './modules/i18n/vocabs/jp';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as frLang } from './modules/i18n/vocabs/fr';
import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { MessageService } from 'primeng/api';
import { ChatDTO } from './DTOs/ChatDTO';
import { AuthService } from './modules/auth';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NetworkConnectionService } from './Services/network-connection.service';
import { ToastAlertService, ToastDTO } from './Services/toast-alert.service';

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {

  subscription: Subscription[] = [];
  isWifiConnected$: Observable<boolean>;
  ticket_id: string;

  constructor(
    private translationService: TranslationService,
    private modeService: ThemeModeService,
    private MessageService: MessageService,
    private ToastService: ToastAlertService,
    private AuthService: AuthService,
    private NetworkConnectionService: NetworkConnectionService,
    private router: Router,
  ) {
    // register translations
    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );
  }
  
  ngOnInit() {
    //? Check Wi-Fi connection constantly
    this.isWifiConnected$ = this.NetworkConnectionService.checkConnection();
    //? Display success / failure message conditionally based on API result
    const subscription_2 = this.ToastService.api_result$.subscribe((api_result: ToastDTO) => {
      console.log('run this?')
      this.showToastMessage(api_result);
    });

    this.subscription.push(subscription_2);
    this.modeService.init();
  }

  navigateToTicketDetails(){
    this.router.navigate(['/crafted/pages/profile/tickets', this.ticket_id]);
    this.MessageService.clear('chat-notification');
  }

  showToastMessage(api_result: ToastDTO): void{
    let msg: any = {
        severity: api_result.severity,
        summary: api_result.summary,
        detail: api_result.detail
    };
    //? Add the "key" parameter conditionally to invoke specific "Toast" message
    if(api_result.key){
      this.MessageService.clear(api_result.key);
      msg.key = api_result.key;
    }
    this.MessageService.add(msg);
  }


  isOnSpecificPage(ticket_id: string): boolean {
    // Check if the segments match the desired path
    return this.router.url === `/crafted/pages/profile/tickets/${ticket_id}`;
}

  ngOnDestroy(): void {
    for(const subscription of this.subscription) subscription.unsubscribe();
  }
}
