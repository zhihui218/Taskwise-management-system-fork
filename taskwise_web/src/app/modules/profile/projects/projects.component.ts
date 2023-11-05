import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateProjectFormComponent } from 'src/app/form-modal/project/create-project-form.component';
import { ProjectGetDTO } from 'src/app/DTOs/ProjectDTO';
import { ProjectService } from 'src/app/Services/project.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { TaskService } from 'src/app/Services/task.service';
import { TicketService } from 'src/app/Services/ticket.service';
import { STATUS } from 'src/app/utils/const';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  providers: [DialogService]
})
export class ProjectsComponent implements OnInit {

  isLoadingPro$: Observable<boolean>;
  isLoadingTask$: Observable<boolean>;
  isLoadingTicket$: Observable<boolean>;
  //* Actual list of project
  projects: ProjectGetDTO[] | undefined;
  //* Projects to be displayed to users
  displayedProjects: ProjectGetDTO[] = [];
  //* To sort the project based on "Pending / On Hold / Completed"
  selectedStatus: String = "All";
  currentDate: Date;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateProject: ProjectGetDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  page: number  = 1;
  limit: number = 4;

  ref: DynamicDialogRef;

  constructor
  (
    private dialogService: DialogService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private ticketService: TicketService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) 
  {
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingTask$ = this.taskService.isLoading$;
    this.isLoadingTicket$ = this.ticketService.isLoading$;

    //* 1. Get the queryParams (E.g., page, limit for retrieving the correct page where the user navigate from)
    const page = this.route.snapshot.queryParamMap.get('page');
    const limit = this.route.snapshot.queryParamMap.get('limit');
    //* 2. If they does exist, fetch the correct data
    if(page) this.page = parseInt(page);
    if(limit) this.limit = parseInt(limit);
  }

  async ngOnInit(): Promise<void>{
    //* Get today's date
    this.currentDate = new Date();
    //* Ignore the "Hour"
    this.currentDate.setHours(0, 0, 0, 0);
    await this.loadData();
  }

  async loadData(): Promise<void>{
    //* 1. Get ticket list based on user roles
    //* IF user.role == "CLIENT || ENGINEER"
    if(this.authService.isClient() || this.authService.isEngineer()) this.pagination = await this.projectService.getClientAndEngineerPaginateProject(this.authService.currentUserValue._id, this.page, this.limit);
    //* IF user.role == "MANAGER"
    else this.pagination = await this.projectService.getPaginateProject(this.page, this.limit);

    if(this.pagination){
      //* Parse the result
      this.paginateProject = this.pagination['docs'] as ProjectGetDTO[];

      for(const project of this.paginateProject){
        //* Track the total number of "Task" and "Ticket" of each project
        project.numOfTask = await this.taskService.getProjectTaskNum(project._id);
        project.numOfTicket = await this.ticketService.getProjectTicketNum(project._id);

        // Update project's status (if necessary)
        let status: string = project.status;
        if(project?.numOfTask.numOfTasks != 0 || project?.numOfTicket.numOfTickets != 0){
          if(project?.numOfTask.numOfTasks == project?.numOfTask.numOfCompletedTasks && project?.numOfTicket.numOfTickets == 0) status = STATUS.COMPLETED
          else if(project?.numOfTask.numOfTasks == project?.numOfTask?.numOfCompletedTasks && project?.numOfTicket?.numOfTickets == project?.numOfTicket?.numOfSolvedTickets) status == STATUS.COMPLETED;
          else status = project.status == STATUS.ONHOLD ? STATUS.ONHOLD : STATUS.PENDING;
        }

        if(status !=  project.status){
          const result = await this.projectService.updateProjectStatus(project._id, status);
          if(result) project.status = status;
        }
      }
      this.sortProjectByStatus(this.selectedStatus);
    }

    //* Append the pagination details to the `current` route
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { page: this.page, limit: this.limit },
        queryParamsHandling: 'merge'
      })
  }

  sortProjectByStatus($event): void{
    if($event == "All"){
      this.displayedProjects = this.paginateProject.filter((project: ProjectGetDTO) => project.status != $event);
    }
    else{
      this.displayedProjects = this.paginateProject.filter((project: ProjectGetDTO) => project.status == $event);
    }  
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData();
  }

  openProjectForm(): void{
    // Show a project form
    this.ref = this.dialogService.open(CreateProjectFormComponent, 
      {
        header: "Create Project",
        width: '80%',
      });

    this.ref.onClose.subscribe(async() => await this.loadData());
  }

  displayDetails(project: ProjectGetDTO){
    this.router.navigate
    (
      //* 1. Route to navigate
      [project._id], 
      { 
        relativeTo: this.route,
        //* 2. Data to be passed when navigate to next route (Note: data lost after page refreshing)
        state: { project: project }
      },
    );
  }
}
