import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { ProjectTaskProgressGetDTO, ProjectTicketProgressGetDTO } from 'src/app/DTOs/ProgressGetDTO';
import { ProjectDashboardDTO, ProjectGetDTO } from 'src/app/DTOs/ProjectDTO';
import { ProjectService } from 'src/app/Services/project.service';
import { TaskService } from 'src/app/Services/task.service';
import { TicketService } from 'src/app/Services/ticket.service';
import { STATUS, PRIORITY, ROLE } from '../const';
import { DateFormatter } from '../DateConverter';

@Component({
  selector: 'app-project-table',
  templateUrl: './project-table.component.html',
  styleUrls: ['./project-table.component.scss'],
  providers: [DialogService]
})
export class ProjectTableComponent implements OnInit {

  STATUS = STATUS; PRIORITY = PRIORITY; ROLE = ROLE;
  dateFormatter = new DateFormatter();
  isLoading: boolean = false;
  //* To sort the project based on "Pending / On Hold / Completed"
  selectedStatus: String = "All";
  currentDate: Date;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateProject: ProjectDashboardDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  page: number  = 1;
  limit: number = 5;
  @Input() role: string;
  @Input() client_id: string;

  constructor
  (
    private projectService: ProjectService,
    private taskService: TaskService,
    private ticketService: TicketService,
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

    if(this.role == ROLE.CLIENT) this.pagination = await this.projectService.managerViewClientProject(this.client_id, this.page, this.limit);
    //* Get project list based on pagination inputs (page, limit)
    else this.pagination = await this.projectService.getPaginateProject(this.page, this.limit);


    if(this.pagination){
      this.paginateProject = [];
      //* Parse the result
      for(const project of this.pagination['docs'] as ProjectGetDTO[]){
        const dashboardPro: ProjectDashboardDTO ={
          _id: project._id,
          name: project.name,
          due_date: project.due_date,
          completed_date: project.completed_date,
          status: project.status,
          priority: project.priority,
          // selectedEngineersID: project.selectedEngineersID
        }

        // Calculate its percentage of completion in task && ticket
        await this.getProjectProgress(dashboardPro);

        this.paginateProject.push(dashboardPro);
      }
    }

    this.isLoading = false;

    this.cdr.detectChanges();
  }

  async getProjectProgress(project: ProjectDashboardDTO): Promise<void>{
    const result: ProjectTaskProgressGetDTO = await this.taskService.getProjectProgress(project._id);

    if(result) project.task_progress = result;

    const result_2: ProjectTicketProgressGetDTO = await this.ticketService.getProjectProgress(project._id);

    if(result) project.ticket_progress = result_2;

    this.calculateAndUpdateProgress(project);
  }

  calculateAndUpdateProgress(project: ProjectDashboardDTO): void{
    //* 1. Calculate the project's task progress (if there's AT LEAST 1 task)
    if(project?.task_progress?.totalCounts){
      project.hasTask = true;
      project.task_completed_percent = parseFloat(((project.task_progress.numOfCompleted / project.task_progress.totalCounts) * 100).toFixed(1));
    }

    //* 2. Calculate the project's ticket progress (if there's AT LEAST 1 ticket)
    if(project?.ticket_progress?.totalCounts){
      project.hasTicket = true;
      project.ticket_completed_percent = parseFloat(((project.ticket_progress.numOfSolved / project.ticket_progress.totalCounts) * 100).toFixed(1));
    }
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData();
  }

  displayDetails(project: ProjectDashboardDTO){
    this.router.navigate
    (
      //* 1. Route to navigate
      ['/crafted/pages/profile/projects', project._id], 
      { 
        //* 2. Data to be passed when navigate to next route (Note: data lost after page refreshing)
        state: { project: project }
      },
    );
  }

}
