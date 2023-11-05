import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TaskProjectGetDTO } from 'src/app/DTOs/TaskDTO';
import { Observable } from 'rxjs';
import { UserGetDTO } from 'src/app/modules/auth';
import { UserService } from 'src/app/Services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketProjectGetDTO } from 'src/app/DTOs/TicketDTO';
import { TICKET_STATUS } from '../const';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss']
})

export class ListViewComponent implements OnInit {

  isMobile: boolean;
  isLoadingUser$: Observable<boolean>;
  //* Check whether we want to display "Task" / "Ticket" list
  isTaskList: boolean = false;
  isLoading: boolean = false;
  @Input() _activeTab: MenuItem;
  //* Sort the "Task / Ticket" list into "Completed", "Today", "This Week", and "This Month" list
  @Input() todayMission: TaskProjectGetDTO[];
  @Input() weeklyMission: TaskProjectGetDTO[];
  @Input() monthlyMission: TaskProjectGetDTO[];
  @Input() overdueMission: TaskProjectGetDTO[];
  @Input() completedMission:TaskProjectGetDTO[];
  @Input() missionType: string;
  @Input() pendingTicket: TicketProjectGetDTO[];
  @Input() reopenedTicket: TicketProjectGetDTO[];
  @Input() solvedTicket: TicketProjectGetDTO[];
  today = new Date();
  TICKET_STATUS = TICKET_STATUS;

  @HostListener("window:resize", ['$event'])
  onResize(event: any){
    if(window.innerWidth <= 425 || screen.width <= 425){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }

  constructor
  (
    private userService: UserService,
    private router: Router,
  )
  {
    this.isLoadingUser$ = this.userService.isLoading$;
  }

  

  ngOnInit(): void {
    if(window.innerWidth <= 425 || screen.width <= 425) this.isMobile = true; 
    else this.isMobile = false;
  }

  navigate(mission_id: string){
    if(this.missionType == "TASK"){
      this.router.navigate(['/crafted/pages/profile/campaigns',`${mission_id}`]);
    }
    else if(this.missionType == "TICKET"){
      this.router.navigate(['/crafted/pages/profile/tickets',`${mission_id}`]);    
    }
  }

  isOverdue(due_date: string){
    const start = new Date(due_date).setHours(0,0,0,0);
    const end = new Date().setHours(0,0,0,0);
    return start < end;
  }

  countOverdueDays(due_date: string): number{
    const start = new Date(due_date);
    const end = new Date(this.today);

    // Set the time components to 00:00:00 for both dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const differenceMs = end.getTime() - start.getTime();

    // Convert the difference to days
    const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

    return days;
  }

}
