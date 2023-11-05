import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { TaskProjectGetDTO } from 'src/app/DTOs/TaskDTO';
import { TaskService } from 'src/app/Services/task.service';
import { AuthService, UserGetDTO } from 'src/app/modules/auth';
import { UserService } from 'src/app/Services/user.service';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TicketService } from 'src/app/Services/ticket.service';
import { TicketProjectGetDTO } from 'src/app/DTOs/TicketDTO';
import { TICKET_STATUS } from 'src/app/utils/const';


@Component({
  selector: 'app-mission-overview',
  templateUrl: './mission-overview.component.html',
  styleUrls: ['./mission-overview.component.scss']
})
export class MissionOverviewComponent implements OnInit {
  //* Tabs of page
  tabs: MenuItem[];
  //* Current active tab
  activeTab: MenuItem;
  //* Check whether we want to display "Task" / "Ticket" list
  isTaskList: boolean;
  isLoading: boolean = false;
  isLoadingTask$: Observable<boolean>;
  isLoadingTicket$: Observable<boolean>;
  project_id: string;
  //* Store all the "Task" list
  missionList: TaskProjectGetDTO[];
  //* Sort the "Task" list into "Completed", "Today", "This Week", and "This Month" list
  todayMission: TaskProjectGetDTO[];
  weeklyMission: TaskProjectGetDTO[];
  monthlyMission: TaskProjectGetDTO[];
  overdueMission: TaskProjectGetDTO[];
  completedMission:TaskProjectGetDTO[];
  missionType: string;
  today = new Date();
  //* Store all the "Ticket" list
  ticketList: TicketProjectGetDTO[];
  //* Sort the "Ticket" list into "Pending", "Reopened", "Solved",
  pendingTicket: TicketProjectGetDTO[];
  reopenedTicket: TicketProjectGetDTO[];
  solvedTicket: TicketProjectGetDTO[];
  // 1. Get the date range of current week for current date
  thisWeek = [startOfWeek(new Date(this.today), { weekStartsOn: 1 }), endOfWeek(new Date(this.today), { weekStartsOn: 1 })];
  // 2. Get the date range of current month for current date
  thisMonth = [startOfMonth(new Date(this.today)), endOfMonth(new Date(this.today))];

  constructor
  (
    private authService: AuthService,
    private location: Location,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private ticketService: TicketService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  )
  {
    this.isLoadingTask$ = this.taskService.isLoading$;
    this.isLoadingTicket$ = this.ticketService.isLoading$;
  }

  async ngOnInit(): Promise<void> {
    //* 1. Get the current path of the url
    const currentRoute = this.route.routeConfig.path;

    //* 2. Get the "_id" of the specific project
    this.project_id = this.route.snapshot.paramMap.get('projectId')!;

    // //* 3. Check whether it needs to retrieve "task / ticket" list
    if(currentRoute == 'projects/:projectId/taskList'){
      this.isTaskList = true;
    //   await this.getTaskList(this.project_id);
      // this.missionType = "TASK";
    }
    else if(currentRoute == 'projects/:projectId/ticketList'){
      this.isTaskList = false;
    //   await this.getTicketList(this.project_id);
      // this.missionType = "TICKET";
    }

    // this.tabs = [
    //   { label: this.isTaskList ? 'Active Tasks' : TICKET_STATUS.PENDING },
    //   { label: this.isTaskList ? 'Overdue' : TICKET_STATUS.REOPENED, icon: 'pi pi-fw pi-flag-fill'},
    //   { label: this.isTaskList ? 'Completed' : TICKET_STATUS.SOLVED, icon: 'pi pi-fw pi-check-circle'}
    // ]
    // //* 1st tab is active by default
    // this.activeTab = this.tabs[0];
    // await this.updateTabValue(this.activeTab);
  }

  async getTaskList(projectId: string): Promise<void>{
    this.missionList = await this.taskService.getProjectTasks(projectId);
  }

  async getTicketList(projectId: string): Promise<void>{
    this.ticketList = await this.ticketService.getProjectTickets(projectId)
  }

  async updateTabValue($event): Promise<void>{ 
    this.isLoading = true;
    this.activeTab = $event; 

    if(this.missionType == "TASK"){
        // 3.Occupy the list conditionally based on the selected "tab"
      if(this.activeTab.label == "Completed" && !this.completedMission){
        //* Get all "COMPLETED" task / ticket
        this.completedMission = this.missionList.filter((mission: TaskProjectGetDTO) => this.isCompleted(mission.status));
        await this.getEngineerList(this.completedMission);
      }
      else if(this.activeTab.label == 'Overdue' && !this.overdueMission){
        //* Get all "OVERDUE" task / ticket
        this.overdueMission = this.missionList.filter((mission: TaskProjectGetDTO) => this.isOverdue(mission.due_date, this.today) && !this.isCompleted(mission.status));
        await this.getEngineerList(this.overdueMission);
      }
      else if(this.activeTab.label == "Active Tasks" && !this.todayMission){
        this.todayMission = []; this.weeklyMission = []; this.monthlyMission = [];
        //* Get all task / ticket (EXCLUDE "OVERDUE" & "COMPLETED")
        const list = this.missionList.filter((mission: TaskProjectGetDTO) => !this.isCompleted(mission.status) && !this.isOverdue(mission.due_date, this.today))
        await this.getEngineerList(list);
        for(const mission of list){
          this.isToday(mission.due_date, this.today) ? this.todayMission.push(mission)
          :
          this.isThisWeek(mission.due_date, this.thisWeek) ? this.weeklyMission.push(mission)
          :
          this.isThisMonth(mission.due_date, this.thisMonth) ? this.monthlyMission.push(mission)
          :
          null;
        }
      } 
    }
    //* If tab == "TICKET"
    else{
      if(this.activeTab.label == TICKET_STATUS.PENDING && !this.pendingTicket){
        this.pendingTicket = this.ticketList.filter((ticket: TicketProjectGetDTO) => ticket.status == TICKET_STATUS.PENDING);
        await this.getClientDetails(this.pendingTicket)
        await this.getEngineerList(this.pendingTicket);
      }
      else if(this.activeTab.label == TICKET_STATUS.REOPENED && !this.reopenedTicket){
        this.reopenedTicket = this.ticketList.filter((ticket: TicketProjectGetDTO) => ticket.status == TICKET_STATUS.REOPENED);
        await this.getClientDetails(this.reopenedTicket);
        await this.getEngineerList(this.reopenedTicket);
      }
      else if(this.activeTab.label == TICKET_STATUS.SOLVED && !this.solvedTicket){
        this.solvedTicket = this.ticketList.filter((ticket: TicketProjectGetDTO) => ticket.status == TICKET_STATUS.SOLVED);
        await this.getClientDetails(this.solvedTicket);
        await this.getEngineerList(this.solvedTicket);
      }
    }
    this.isLoading = false;
    this.cdr.detectChanges(); // Trigger change detection
  }

  isCompleted(status: string){
    return status == "Completed";
  }

  isOverdue(due_date: string, today: Date){
    const start = new Date(due_date).setHours(0,0,0,0);
    const end = new Date(today).setHours(0,0,0,0);
    return start < end;
  }

  isToday(due_date: string, today: Date){
    const start = new Date(due_date).setHours(0,0,0,0);
    const end = new Date(today).setHours(0,0,0,0);
    return start == end;
  }

  isThisWeek(due_date: string, thisWeek: any[]){
    const start = new Date(due_date).setHours(0,0,0,0);
    const startWeek = new Date(thisWeek[0]).setHours(0,0,0,0);
    const endWeek = new Date(thisWeek[1]).setHours(0,0,0,0);
    return startWeek < start && start  <= endWeek;
  }

  isThisMonth(due_date: string, thisMonth: any[]){
    const start = new Date(due_date).setHours(0,0,0,0);
    const startMonth = new Date(thisMonth[0]).setHours(0,0,0,0);
    const endMonth = new Date(thisMonth[1]).setHours(0,0,0,0);
    return startMonth < start && start <= endMonth;
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

  async getEngineerList(missions: TaskProjectGetDTO[] | TicketProjectGetDTO[]): Promise<void>{
    for(const mission of missions){
      // To store the "UserGetDTO" object of each "task / ticket"
      mission.engineers = [];
      if(mission.selectedEngineersID){
        for(const id of mission.selectedEngineersID){
          const user: UserGetDTO = await this.userService.getUserById(id);
    
          mission.engineers.push(user);
        }
      }
    }
  }

  //* Get the client details (IF viewing "TICKET" list)
  async getClientDetails(tickets: TicketProjectGetDTO[]){

    for(const ticket of tickets){
      let client: UserGetDTO = await this.userService.getUserById(ticket.client_id);

      ticket.client = client;
    }
  }

  goBack(): void{
    this.location.back();
  }

  isClient(): boolean{ return this.authService.isClient(); }



}
