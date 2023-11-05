import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable } from 'rxjs';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { TaskGetDTO } from 'src/app/DTOs/TaskDTO';
import { TaskService } from 'src/app/Services/task.service';
import { CreateTaskFormComponent } from 'src/app/form-modal/task/create-task-form.component';
import { AuthService } from '../../auth';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.component.html',
  providers: [DialogService]
})

export class CampaignsComponent {

  ROLE = ROLE;
  isLoading$: Observable<boolean>;
  // tasks: TaskGetDTO[] | undefined;
  //* To sort the project based on "Pending / On Hold / Completed"
  //* Tasks to be displayed to users
  displayedTasks: TaskGetDTO[] = [];
  selectedStatus: String = "All";
  currentDate: Date;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateTask: TaskGetDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  page: number  = 1;
  limit: number = 4;

  ref: DynamicDialogRef;

  constructor
  (
    private dialogService: DialogService,
    private taskService: TaskService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isLoading$ = this.taskService.isLoading$;
    
    //* 1. Get the queryParams (E.g., page, limit for retrieving the correct page where the user navigate from)
    const page = this.route.snapshot.queryParamMap.get('page');
    const limit = this.route.snapshot.queryParamMap.get('limit');
    //* 2. If they does exist, fetch the correct data
    if(page) this.page = parseInt(page);
    if(limit) this.limit = parseInt(limit);
  }

  async ngOnInit(): Promise<void> 
  {
    //* Get today's date
    this.currentDate = new Date();
    //* Ignore the "Hour"
    this.currentDate.setHours(0, 0, 0, 0);
    await this.loadData();
    // await this.getAllTasks();
  }

  openTaskForm(): void{
    this.ref = this.dialogService.open(CreateTaskFormComponent, 
      {
        header: "Create Task",
        width: '80%'
      });

    //! Can to Observable<TaskGetDTO[]> later so that no need to call API very time
    this.ref.onClose.subscribe(async() => await this.loadData());
  }

  async loadData(): Promise<void>{
    //* Get project list based on pagination inputs (page, limit)

    // IF user.role == "ENGINEER"
    if(this.isEngineer()) this.pagination = await this.taskService.getEngineerPaginateTask(this.authService.currentUserValue._id, this.page, this.limit);
    // IF user.role == "MANAGER"
    else this.pagination = await this.taskService.getPaginateTask(this.page, this.limit);

    if(this.pagination){
      this.paginateTask = this.pagination['docs'] as TaskGetDTO[];
      this.sortTaskByStatus(this.selectedStatus);
    }

    //* Append the pagination details to the `current` route
    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { page: this.page, limit: this.limit },
        queryParamsHandling: 'merge'
      })
  }

  sortTaskByStatus($event): void{
    if($event == "All"){
      this.displayedTasks = this.paginateTask.filter((task: TaskGetDTO) => task.status != $event);
    }
    else{
      this.displayedTasks = this.paginateTask.filter((task: TaskGetDTO) => task.status == $event);
    }  
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData();
  }

  displayDetails(task: TaskGetDTO){
    this.router.navigate(
      [task._id], 
      { 
        relativeTo: this.route,
        state:{ task: task },
      });
  }

  isEngineer(): boolean{ return this.authService.isEngineer(); }

}