import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { LayoutService } from './core/layout.service';
import { LayoutInitService } from './core/layout-init.service';
import { Observable } from 'rxjs';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UpdateUserDetailComponent } from 'src/app/form-modal/update-user-detail/update-user-detail.component';
import { RealTimeService } from 'src/app/Services/real-time.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  providers:[DialogService],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  // Public variables
  selfLayout = 'default';
  asideSelfDisplay: true;
  asideMenuStatic: true;
  contentClasses = '';
  contentContainerClasses = '';
  toolbarDisplay = true;
  contentExtended: false;
  asideCSSClasses: string;
  asideHTMLAttributes: any = {};
  headerMobileClasses = '';
  headerMobileAttributes = {};
  footerDisplay: boolean;
  footerCSSClasses: string;
  headerCSSClasses: string;
  headerHTMLAttributes: any = {};
  // offcanvases
  extrasSearchOffcanvasDisplay = false;
  extrasNotificationsOffcanvasDisplay = false;
  extrasQuickActionsOffcanvasDisplay = false;
  extrasCartOffcanvasDisplay = false;
  extrasUserOffcanvasDisplay = false;
  extrasQuickPanelDisplay = false;
  extrasScrollTopDisplay = false;
  asideDisplay: boolean;
  @ViewChild('ktAside', { static: true }) ktAside: ElementRef;
  @ViewChild('ktHeaderMobile', { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild('ktHeader', { static: true }) ktHeader: ElementRef;
  // First Time Login
  user$: Observable<UserModel>;
  ref: DynamicDialogRef | undefined;

  shouldDisplayOverlay: boolean = false;


  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private authService: AuthService,
    private RealTimeService: RealTimeService,
    public dialogService: DialogService,
    
  ) {
    this.initService.init();
  }

  toggleOverlay($event): void{
    this.shouldDisplayOverlay = $event;
  }

  ngOnInit(): void {
    // build view by layout config settings
    this.asideDisplay = this.layout.getProp('aside.display') as boolean;
    this.toolbarDisplay = this.layout.getProp('toolbar.display') as boolean;
    this.contentContainerClasses = this.layout.getStringCSSClasses('contentContainer');
    this.asideCSSClasses = this.layout.getStringCSSClasses('aside');
    this.headerCSSClasses = this.layout.getStringCSSClasses('header');
    this.headerHTMLAttributes = this.layout.getHTMLAttributes('headerMenu');
    this.footerCSSClasses = this.layout.getStringCSSClasses('footer');
    // Display form for user to fill in if he / she first time login
    this.user$ = this.authService.currentUserSubject.asObservable();
    this.user$.subscribe((user: UserModel) => 
    {
      if(user) this.RealTimeService.registerActiveUser(user.name, user._id);
      if(user && user.firstLogin) this.showDialog(user);
    })
  }

  //* Show the form for user to fill in details for first time login
  showDialog(user: UserModel): void{
    this.ref = this.dialogService.open(UpdateUserDetailComponent, 
      { 
        header: 'Fill in Personal Details',
        width: "60%",
        closable: false,
        data: {
          _id: user._id,
          name: user.name
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.ktHeader) {
      for (const key in this.headerHTMLAttributes) {
        if (this.headerHTMLAttributes.hasOwnProperty(key)) {
          this.ktHeader.nativeElement.attributes[key] =
            this.headerHTMLAttributes[key];
        }
      }
    }
  }
}
