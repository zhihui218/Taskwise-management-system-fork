import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { DateFormatter } from '../DateConverter';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { TaskDashboardDTO, TaskGetDTO } from 'src/app/DTOs/TaskDTO';
import { UserGetDTO } from 'src/app/modules/auth';
import { TaskService } from 'src/app/Services/task.service';
import { AuthService } from 'src/app/modules/auth';
import { STATUS, PRIORITY } from '../const';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss'],
  providers: [DialogService]
})

//? Utilized for displaying task table in "Dashboard" and task list of a project for a "CLIENT"
export class TaskTableComponent implements OnInit {

  STATUS = STATUS; PRIORITY = PRIORITY;
  dateFormatter = new DateFormatter();
  isLoading: boolean = false;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateTask: TaskDashboardDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  @Input() page: number;
  //? Either "Dashboard" / "Project"
  @Input() navigationPage: 'Project' | 'Dashboard';
  @Input() rowPerPageOptions: number[];
  @Input() limit: number;
  @Input() project_id: string;


  constructor
  (
    private taskService: TaskService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
  }
  
  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData();
  }

  async loadData(): Promise<void>{
    this.isLoading = true;

    // IF user.role == "ENGINEER"
    if(this.isEngineer()) this.pagination = await this.taskService.getEngineerPaginateTask(this.authService.currentUserValue._id, this.page, this.limit);
    // IF user.role == "CLIENT"
    else if(this.isClient() || this.isNavigatingFromProject()) this.pagination = await this.taskService.getProjectPaginateTask(this.project_id, this.page, this.limit);
    // IF user.role == "MANAGER"
    else this.pagination = await this.taskService.getPaginateTask(this.page, this.limit);

    if(this.pagination){
      this.paginateTask = [];

      for(const task of this.pagination['docs'] as TaskGetDTO[]){
        const dashboardTask: TaskDashboardDTO = {
          _id: task._id,
          name: task.name,
          due_date: task.due_date,
          completed_date: task.completed_date,
          status: task.status,
          priority: task.priority,
          selectedLeaderID: task.selectedLeaderID,
          selectedEngineersID: task.selectedEngineersID
        }

        //? Load the details of engineers for "CLIENT" site
        if(this.isNavigatingFromProject()){
          dashboardTask.selectedLeader = await this.userService.getUserById(dashboardTask.selectedLeaderID);

          dashboardTask.selectedEngineers = [];
          for(const engineer_id of dashboardTask?.selectedEngineersID){
            const engineer: UserGetDTO = await this.userService.getUserById(engineer_id);
            dashboardTask.selectedEngineers.push(engineer);
          }
        }

        this.paginateTask.push(dashboardTask);
      }
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  displayDetails(task: TaskDashboardDTO){
    this.router.navigate(
      ['/crafted/pages/profile/campaigns', task._id], 
      { 
        relativeTo: this.route,
        state:{ task: task },
      });
  }

  isNavigatingFromProject(): boolean{ return this.navigationPage == "Project" }

  isEngineer(): boolean{ return this.authService.isEngineer(); }
  isClient(): boolean{ return this.authService.isClient(); }

}
