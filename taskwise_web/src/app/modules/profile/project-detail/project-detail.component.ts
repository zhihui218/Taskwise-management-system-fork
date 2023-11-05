import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectGetDTO } from 'src/app/DTOs/ProjectDTO';
import { ProjectService } from 'src/app/Services/project.service';
import { ConfirmationService } from 'primeng/api';
import { TaskService } from 'src/app/Services/task.service';
import { UserGetDTO } from '../../auth/models/user.model';
import { UserService } from 'src/app/Services/user.service';
import { TicketService } from 'src/app/Services/ticket.service';
import { ProjectTaskProgressGetDTO, ProjectTicketProgressGetDTO } from 'src/app/DTOs/ProgressGetDTO';
import { ChartService } from 'src/app/Services/chart.service';
import { ROLE, STATUS, TICKET_STATUS } from 'src/app/utils/const';
import { AuthService } from '../../auth';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  providers: [ConfirmationService]
})
export class ProjectDetailComponent implements OnInit {

  ROLE = ROLE;
  isEditMode: boolean = false;
  isLoadingUser$: Observable<boolean>;
  isLoadingPro$: Observable<boolean>;
  isLoadingTask$: Observable<boolean>;
  isLoadingTicket$: Observable<boolean>;
  isDeleting: boolean = false;
  editProject: FormGroup;
  project: ProjectGetDTO | undefined;
  selectedLeader: UserGetDTO | undefined;
  selectedEngineerList: UserGetDTO[] | undefined;
  selectedClient: UserGetDTO | undefined;
  isMobile: boolean;
  //* Chart Value
  // For "Task" Progress
  data_1: number[] = [0, 0, 0];
  label_1: string[] = [STATUS.PENDING, STATUS.ONHOLD, STATUS.COMPLETED]

  // For "Ticket" Progress
  data_2: number[] = [0, 0, 0];
  label_2: string[] = [TICKET_STATUS.PENDING, TICKET_STATUS.REOPENED, TICKET_STATUS.SOLVED];

  //* Background color of the "Pie Chart"
  backgroundColor: string[] = ['#F6D797','#7BE4E4','#00DFA2']

  @ViewChild("task_chart") task_chart: ElementRef;
  @ViewChild("ticket_chart") ticket_chart: ElementRef;


  @HostListener("window:resize", ['$event'])
  onResize(event: any){
    if(window.innerWidth <= 425 || screen.width <= 425){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private projectService: ProjectService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private ToastService: ToastAlertService,
    private taskService: TaskService,
    private ticketService: TicketService,
    private chartService: ChartService,
    private cdr: ChangeDetectorRef
  ) 
  {
    this.isLoadingUser$ = this.userService.isLoading$;
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingTask$ = this.taskService.isLoading$;
    this.isLoadingTicket$ = this.ticketService.isLoading$;
    //* 1. Check whether "Project" object exists in the "NavigationExtras" object (Lost after page refreshing)
    //? Reason: "NavigationExtras" object disappear once the navigation is completed (Hence, retrieve at constructor)
  }

  async ngOnInit(): Promise<void> {
    if(window.innerWidth <= 425 || screen.width <= 425) this.isMobile = true; 
    else this.isMobile = false;

    //* Get project `_id`
    const projectId = this.route.snapshot.paramMap.get('projectId')!;
    // Get project details
    await this.getProjectDetails(projectId);
  }

  goBack(): void { this.location.back(); }

  async getProjectDetails(projectId: string): Promise<void>{
    // 1. Get the project details
    this.project = await this.projectService.getProjectDetails(projectId);

    if(this.project){
      // 2. Retrieve of the project's progress
      await this.getProjectProgress();
      // 3. Calculate the project's progress (if necessary)
      await this.calculateAndUpdateProgress();
      // 3. Get selected engineers, leader, client of that project
      await this.getProjectClient();
    }
  }

  async getProjectProgress(): Promise<void>{
    const result: ProjectTaskProgressGetDTO = await this.taskService.getProjectProgress(this.project._id);

    if(result) this.project.task_progress = result;

    const result_2: ProjectTicketProgressGetDTO = await this.ticketService.getProjectProgress(this.project._id);

    if(result) this.project.ticket_progress = result_2;

    //* Update the `html` template
    this.cdr.detectChanges();
  }

  async getProjectClient(): Promise<void>{
    if (this.project) {
      // 2. Get client's details
      this.selectedClient = await this.userService.getUserById(this.project.client_id)
    }
  }

  async updateProject(project: ProjectGetDTO): Promise<void>{
    this.project = { 
      task_progress: this.project?.task_progress,
      ticket_progress: this.project?.ticket_progress,
      ...project 
    };
    //* Draw the Pie Chart again
    await this.getProjectClient();
  }

  //* Draw the "PIE CHART" for project progress
  async calculateAndUpdateProgress(): Promise<void>{
    //* 1. Calculate the project's task progress (if there's AT LEAST 1 task)
    if(this.project?.task_progress?.totalCounts){
      this.data_1[0] = parseFloat(((this.project.task_progress.numOfPending / this.project.task_progress.totalCounts) * 100).toFixed(1));
      this.data_1[1] = parseFloat(((this.project.task_progress.numOfOnHold / this.project.task_progress.totalCounts) * 100).toFixed(1));
      this.data_1[2] = parseFloat(((this.project.task_progress.numOfCompleted / this.project.task_progress.totalCounts) * 100).toFixed(1));
      // Draw Chart
      if(this.task_chart) this.chartService.createPieChart("taskProgress", this.data_1, this.label_1, this.backgroundColor, "Task Progress");
    }

    //* 2. Calculate the project's ticket progress (if there's AT LEST 1 ticket)
    if(this.project?.ticket_progress?.totalCounts){
      this.data_2[0] = parseFloat(((this.project.ticket_progress.numOfPending / this.project.ticket_progress.totalCounts) * 100).toFixed(1));
      this.data_2[1] = parseFloat(((this.project.ticket_progress.numOfReopened / this.project.ticket_progress.totalCounts) * 100).toFixed(1));
      this.data_2[2] = parseFloat(((this.project.ticket_progress.numOfSolved / this.project.ticket_progress.totalCounts) * 100).toFixed(1));
      // Draw Chart
      if(this.ticket_chart) this.ticket_chart = this.chartService.createPieChart("ticketProgress", this.data_2, this.label_2, this.backgroundColor, "Ticket Progress")
    }
  }

  async openConfirmationDialog(): Promise<void>{
    this.confirmationService.confirm({
      message: 'All the related tasks and tickets will also be deleted. Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        this.isDeleting = true;
        const isSuccess = await this.deleteProject(); 
        this.isDeleting = false;
        if(isSuccess){
          this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve delete the project successfully!');
          this.goBack();
        }
        else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
      },
      reject: () => {}
    })
  }

  async deleteProject(): Promise<boolean>{
    if(this.project){
      //* 1. Delete all the "UPLOADED" files of the project (The folder can only be deleted IF it's EMPTY)
      await this.projectService.deleteProjectAttachment(this.project._id, this.project.attachments);
      //* 2. Delete the project itself
      let result = await this.projectService.deleteProject(this.project._id);
      //* 3. Delete the associated "Task"
      result = await this.taskService.deleteProjectTask(this.project._id);
      //* 4. Delete the associated "Ticket"
      result = await this.ticketService.deleteProjectTicket(this.project._id);
      return result;
    }
    return undefined;
  }

  //* Navigate to the task list of the project
  displayTaskList(){
    this.router.navigate(['taskList'], { relativeTo: this.route });
  }

  //* Navigate to the ticket list of the project
  displayTicketList(){
    this.router.navigate(['ticketList'], { relativeTo: this.route });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    //* Update the `html` template manually by checking its data / binding
    if(!this.isEditMode) this.createGraph();
  }

  createGraph(){
    this.cdr.detectChanges();
    if(this.project?.task_progress?.totalCounts && this.task_chart) this.chartService.createPieChart("taskProgress", this.data_1, this.label_1, this.backgroundColor, "Task Progress");
    if(this.project?.ticket_progress?.totalCounts && this.ticket_chart) this.ticket_chart =  this.chartService.createPieChart("ticketProgress", this.data_2, this.label_2, this.backgroundColor, "Ticket Progress")  
  }
}
