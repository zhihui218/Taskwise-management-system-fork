import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { NotificationGetDTO } from 'src/app/DTOs/NotificationDTO';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { NotificationService } from 'src/app/Services/notification.service';
import { AuthService } from 'src/app/modules/auth';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { NOTIFICATION_TYPE, ROLE } from 'src/app/utils/const';
import { Router } from '@angular/router';
import { RealTimeService } from 'src/app/Services/real-time.service';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})

export class TopbarComponent implements OnInit, OnDestroy {

  ROLE = ROLE;
  DateFormatter = new DateFormatter();
  private unsubscribe$: Subscription[];
  hasUnreadChat: boolean;
  notificationTypeIcons: any;
  // //? When "Load More" button is pressed, load the older "notification"
  // currentLoad: number = 0;
  //? To check whether there is older list of notification
  hasNextPage: boolean;
  //? Determine the value to be displayed for the `badge` of notification
  numOfNotification: number = 0;
  notification_list: NotificationGetDTO[] = [];
  isLoading$: Observable<boolean>;
  @ViewChild("op") op: any;
  //? Hide the overlay panel of notification when the window is scrolled
  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
  if(this.op) this.op.hide();
}

  constructor(
    public AuthService: AuthService,
    private NotificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private ToastService: ToastAlertService,
    private router: Router,
    private RealTimeService: RealTimeService
    ){ 
      this.isLoading$ = this.NotificationService.isLoading$; 
      this.unsubscribe$ = [];
      //? Set up the icons for different types of notification
      this.notificationTypeIcons = {
        'task_assigned': 'bi bi-stack me-3 font-color-task',
        'project_created': 'bi bi-briefcase me-3 font-color-project',
        'project_completed': 'bi bi-check-circle me-3 font-color-completed',
        'ticket_created': 'bi bi-ticket me-3 font-color-ticket',
        'ticket_solved': 'bi bi-check-circle me-3 font-color-solved',
        'ticket_reopened': 'bi bi-exclamation-diamond me-3 font-color-reopened',
        'ticket_due_date': 'bi bi-calendar me-3 main-color',
        'chat_received': 'bi bi-chat-left-dots me-3 font-color-chat'
      }
    }

  async ngOnInit(): Promise<void> {
    //? Push real-time notification to user that's online
    const subscription = this.RealTimeService.onNewNotification().subscribe((notification: NotificationGetDTO | undefined) => {
        if(notification){
            //* Latest notification at index 0
            this.notification_list.unshift(notification);
            this.numOfNotification++;
            this.cdr.detectChanges();
            this.ToastService.invokeToastAlert('info', 'New Notification', 'View Your Notification','notification');
          }
    })
    this.unsubscribe$.push(subscription);
    this.numOfNotification = await this.NotificationService.getNumOfUnread(this.AuthService.currentUserValue._id);
    await this.loadNotification();
  }

  async loadNotification(): Promise<void> {
    // //? Load for `subsequent` notification
    // this.currentLoad += 1;

    const notifications: PaginateGetDTO = await this.NotificationService.getNotification(this.AuthService.currentUserValue._id, this.notification_list.length);

    if(notifications){
      //* 1. Check whether to display "Load More" button
      this.hasNextPage = notifications?.nextPage ? true : false;
      //? If the `notification_list` is empty, fill up the empty list
      for(const notification of notifications.docs as NotificationGetDTO[]) this.notification_list.push(notification);
    }
    this.cdr.detectChanges();
  }

  async removeNotification($event: any, index: number): Promise<void>{
    //? Avoid invoking "click" event on parent
    $event.stopPropagation();
    const result = await this.NotificationService.removeUserFromNotification(this.notification_list[index]._id, this.AuthService.currentUserValue._id);
    if(result){
      //? The notification is deleted before it's read
      if(!this.notification_list[index].recipients.isRead) this.numOfNotification--;
      this.notification_list.splice(index, 1);
    }
    else this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs while deleting notification, Please try again!');
    this.cdr.detectChanges();
  }

  async removeAllNotification(): Promise<void> {
    const result = await this.NotificationService.removeAllNotification(this.AuthService.currentUserValue._id);
    if(result){ this.notification_list = []; this.numOfNotification = 0; this.hasNextPage = false; }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs while deleting notification, Please try again!'); }
    this.cdr.detectChanges();
  }

  //? Let the user to navigate to the specific details of notification
  async navigateToDetails(index: number): Promise<void>{
    const result = await this.updateNotificationAsRead(index);
    if(!result) return; //? Update fails (Hence, do not navigate)

    //? Hide the notification list while navigating
    this.op.hide();
    switch(this.notification_list[index].notification_type){
      case NOTIFICATION_TYPE.TASK_ASSIGNED:
        this.router.navigate(['crafted/pages/profile/campaigns', this.notification_list[index].model_id]);
        break;
      case NOTIFICATION_TYPE.PROJECT_CREATED:
      case NOTIFICATION_TYPE.PROJECT_COMPLETED:
        this.router.navigate(['crafted/pages/profile/projects', this.notification_list[index].model_id]);
        break;
      case NOTIFICATION_TYPE.TICKET_CREATED:
      case NOTIFICATION_TYPE.TICKET_REOPENED:
      case NOTIFICATION_TYPE.TICKET_SOLVED:
      case NOTIFICATION_TYPE.TICKET_DUE_DATE:
        this.router.navigate(['crafted/pages/profile/tickets', this.notification_list[index].model_id]);
        break;
      default: null;
    }
  }

  //? Check whether to update the `notification` "isRead"
  private async updateNotificationAsRead(index: number): Promise<boolean>{
    //? Go the API only if the notification is not read
    if(!this.notification_list[index].recipients.isRead){
      //? Mark the `notification` as read for the user
      const result = await this.NotificationService.markAsRead(this.notification_list[index]._id, this.AuthService.currentUserValue._id);
      if(result){
        this.notification_list[index] = result;
        if(this.numOfNotification > 0) this.numOfNotification--;
      }
      else{ 
        this.ToastService.invokeToastAlert('error', 'Error','Unexpected error while reading notification. Please try again');
        return false; 
      }
    }
    return true;
  }

  ngOnDestroy(): void {
    for(const subscription of this.unsubscribe$) subscription.unsubscribe;
  }
}
