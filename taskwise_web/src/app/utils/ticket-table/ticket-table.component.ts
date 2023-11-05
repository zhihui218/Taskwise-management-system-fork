import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DateFormatter } from '../DateConverter';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { TicketService } from 'src/app/Services/ticket.service';
import { AuthService, UserGetDTO } from 'src/app/modules/auth';
import { TicketDashboardGetDTO, TicketGetDTO } from 'src/app/DTOs/TicketDTO';
import { TICKET_STATUS, PRIORITY } from 'src/app/utils/const';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-ticket-table',
  templateUrl: './ticket-table.component.html',
  styleUrls: ['./ticket-table.component.scss'],
  providers: [DialogService]
})
export class TicketTableComponent implements OnInit {

  TICKET_STATUS = TICKET_STATUS; PRIORITY = PRIORITY;
  dateFormatter = new DateFormatter();
  isLoading: boolean = false;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateTicket: TicketDashboardGetDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  // page: number  = 1;
  // limit: number = 10;
  @Input() navigationPage: 'Project' | 'Dashboard';
  @Input() page: number;
  @Input() rowPerPageOptions: number[];
  @Input() limit: number;
  @Input() task_id: string;
  @Input() project_id: string;


  constructor
  (
    private ticketService: TicketService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  )
  {
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void>{
    this.isLoading = true;

    //* Load the ticket list of a "Task" in 'task-details' page
    if(this.task_id) this.pagination = await this.ticketService.getTaskPaginateTicket(this.task_id, this.page, this.limit);
    //* Load the ticket list of a "Project" in 'project-details' page
    else if(this.project_id) this.pagination = await this.ticketService.getProjectPaginateTicket(this.project_id, this.page, this.limit);
    //* IF user.role == "CLIENT || ENGINEER", load their tickets at "Dashboard" Page
    else if(this.isClient() || this.isEngineer()) this.pagination = await this.ticketService.getClientAndEngineerPaginateTicket(this.authService.currentUserValue._id, this.page, this.limit);
    //* IF user.role == "MANAGER", load ALL tickets at "Dashboard" page
    else this.pagination = await this.ticketService.getPaginateTicket(this.page, this.limit);

    if(this.pagination){

      this.paginateTicket = [];

      for(const ticket of this.pagination['docs'] as TicketGetDTO[]){
        const dashboardTic: TicketDashboardGetDTO = {
          _id: ticket._id,
          name: ticket.name,
          created_date: ticket.created_date,
          completed_date: ticket.completed_date,
          due_date: ticket?.due_date,
          status: ticket.status,
          priority: ticket.priority,
          selectedLeaderID: ticket.selectedLeaderID,
          selectedLeader: ticket.selectedLeader,
          // selectedEngineersID: ticket?.selectedEngineersID,
        }

        // //? Load the engineers details for ticket list of a "Task"
        // if(this.task_id){
        //   dashboardTic.selectedLeader = await this.userService.getUserById(dashboardTic.selectedLeaderID);
        //   // dashboardTic.engineers = [];
        //   // for(const engineer_id of ticket?.selectedEngineersID){
        //   //   const engineer: UserGetDTO = await this.userService.getUserById(engineer_id);
        //   //   dashboardTic.engineers.push({...engineer});
        //   // }
        // }

        this.paginateTicket.push(dashboardTic);
      }
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData();
  }

  displayDetails(ticket: TicketGetDTO){
    this.router.navigate
    (
      //* 1. Route to navigate
      ['/crafted/pages/profile/tickets', ticket._id], 
      { 
        relativeTo: this.route,
        //* 2. Data to be passed when navigate to next route (Note: data lost after page refreshing)
        state: { ticket: ticket }
      },
    );
  }

  isNavigatingFromProject(): boolean{ return this.navigationPage == "Project" }


  isClient(): boolean { return this.authService.isClient(); }
  isEngineer(): boolean { return this.authService.isEngineer(); }

}
