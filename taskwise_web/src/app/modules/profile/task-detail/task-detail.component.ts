import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { TaskGetDTO } from 'src/app/DTOs/TaskDTO';
import { ProjectTaskGetDTO } from 'src/app/DTOs/ProjectDTO';
import { TaskService } from 'src/app/Services/task.service';
import { ProjectService } from 'src/app/Services/project.service';
import { UserService } from 'src/app/Services/user.service';
import { ConfirmationService } from 'primeng/api';
import { AuthService, UserGetDTO } from '../../auth';
import { STATUS } from 'src/app/utils/const';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateTicketFormComponent } from 'src/app/form-modal/ticket/create-ticket-form.component';
import { TicketService } from 'src/app/Services/ticket.service';
import { ChartService } from 'src/app/Services/chart.service';
import { TICKET_STATUS } from 'src/app/utils/const';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  providers: [ConfirmationService, DialogService]
})
export class TaskDetailComponent implements OnInit {
  isEditMode: boolean = false;
  isLoadingPro$: Observable<boolean>;
  isLoadingTask$: Observable<boolean>;
  isLoadingUser$: Observable<boolean>;
  isLoading$: boolean = false;
  //* Track task deleting process;
  isDeleting: boolean = false;
  editTask: FormGroup;
  //* Deals with the current "Task" object
  task: TaskGetDTO | undefined;
  chart: any;
  //* Deals with the "Project" object which the "Task" object belongs to
  // Constants
  STATUS = STATUS;
  @ViewChild('ticketTable') ticketTable: any;
  @ViewChild('ticket_chart') ticket_chart: ElementRef;

  ref: DynamicDialogRef;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private taskService: TaskService,
    private projectService: ProjectService,
    private ticketService: TicketService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private ToastService: ToastAlertService,
    private dialogService: DialogService,
    private chartService: ChartService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isLoadingTask$ = this.taskService.isLoading$;
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingUser$ = this.userService.isLoading$;
    //* 1. Check whether "Task" object exists in the "NavigationExtras" object (Lost after page refreshing)
    //? Reason: "NavigationExtras" object disappear once the navigation is completed (Hence, retrieve at constructor)
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe(async(params) => {
      await this.reloadComponent();
      await this.ticketTable.loadData();
    });
  }

  async reloadComponent(): Promise<void> {
    const taskId = this.route.snapshot.paramMap.get('taskId')!;

    //* 2. Get information of the task (ONLY when page refresh)
    await this.getTaskDetails(taskId);  
  }

  async getTaskDetails(taskId: string): Promise<void>{
     // 1. Get the details of specific task
    this.task = await this.taskService.getTaskDetails(taskId);

    if(this.task){
      // 2. Draw the "Pie Chart" for ticket
      this.drawTicketPieChart(this.task);

      // 3. Get the information of the project which the task belongs to
      this.task.project = await this.projectService.getProjectOfTask(this.task.projectID);

      // 4. Get the engineers' information of the task
      await this.getTaskEngineer();
    }
  }

  async updateTask(task: TaskGetDTO | undefined): Promise<void>{
    const updated = { ...task, ticket_progress: this.task.ticket_progress }
    this.task = updated;
    this.task.project =  await this.projectService.getProjectOfTask(this.task.projectID);
    await this.getTaskEngineer();
  }

  //* Although a task has "Pending / On Hold / Completed" in status, we will toggle between "Completed" AND "Pending" status
  async updateTaskStatus(): Promise<void>{
    // To toggle the task status between "Completed" AND "Pending"
    const status: string = this.task.status == "Completed" ? "Pending" : "Completed";
    const updatedTask: TaskGetDTO | undefined = await this.taskService.updateTaskStatus(this.task._id, status);

    if(updatedTask){ 
      this.task = {
        selectedLeader: this.task.selectedLeader,
        selectedEngineers: this.task.selectedEngineers,
        ticket_progress: this.task.ticket_progress,
        project: this.task?.project,
        ...updatedTask,
      };
      //? Draw the chart again
      this.drawTicketPieChart(this.task);
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
  }

  async getTaskEngineer(): Promise<void>{
    //* 1. Get the "Main Contact Person"
    const selectedLeader = await this.userService.getUserById(this.task.selectedLeaderID);
    if(selectedLeader) this.task.selectedLeader = selectedLeader;

    //* 2. Get the rest of engineers if any
    const selectedEngineerList: UserGetDTO[] = [];
    for(const user_id of this.task.selectedEngineersID){
      const engineer = await this.userService.getUserById(user_id);
      selectedEngineerList.push(engineer);
    }
    this.task.selectedEngineers = selectedEngineerList;
    this.cdr.detectChanges();
  }

  async openConfirmationDialog(): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        this.isDeleting = true;
        const isSuccess = await this.deleteTask(); 
        this.isDeleting = false;
        if(isSuccess){
          this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve delete the task successfully!');
          this.goBack();
        }
        else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
      },
      reject: () => {}
    })
  }

  navigateToProject(): void {
    this.router.navigate(['/crafted/pages/profile/projects', this.task.projectID])
  }

  async deleteTask(): Promise<boolean>{
    if(this.task){
      //* Delete all the "UPLOADED" files of the task (The folder can only be deleted IF it's EMPTY)
      await this.taskService.deleteTaskAttachment(this.task._id, this.task.attachments);
      //* Delete the task itself
      let result = await this.taskService.deleteTask(this.task._id);
      //* Delete all its associated "tickets"
      result = await this.ticketService.deleteTaskTicket(this.task._id);
      this.task = undefined;
      return result;
    }
    return true;
  }

  goBack(): void {
    this.location.back();
  }

  //? Disable the "Mark as Completed" button if there's issue ticket && issue ticket is not solved
  enableStatusBtn(): boolean{
    return this.task.ticket_progress.totalCounts == 0 || (this.task.ticket_progress.solvedPercent == 100)
  }

  private drawTicketPieChart(task: TaskGetDTO): void {
      // For "Ticket" Progress
      let data: number[] = [task.ticket_progress.pendingPercent, task.ticket_progress.reopenedPercent, task.ticket_progress.solvedPercent];
      let label: string[] = [TICKET_STATUS.PENDING, TICKET_STATUS.REOPENED, TICKET_STATUS.SOLVED];
      let backgroundColor: string[] = ['#F6D797','#7BE4E4','#00DFA2']
      this.cdr.detectChanges();
      if(this.chart){ this.chart.destroy(); }
      if(this.ticket_chart && this.task.ticket_progress.totalCounts) this.chart = this.chartService.createPieChart("ticketProgress", data, label, backgroundColor, "Ticket Progress")
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if(!this.isEditMode) this.drawTicketPieChart(this.task);
  }

  //* Allow "CLIENT" to manage ticket
  openTicketForm(): void{
    // Show a ticket form
    this.ref = this.dialogService.open(CreateTicketFormComponent, 
      {
        header: "Create Ticket",
        width: '80%',
        data: { task: this.task }
      });
      
    //? Reload the "Task-detail" page when a new ticket is created
    this.ticketService.isCreatingTicketSubject.asObservable().subscribe(async (isCreated: boolean) => { 
      if(isCreated) {
        await this.reloadComponent();
        await this.ticketTable.loadData();
      }
    });
    this.ref.onClose.subscribe(async() =>  this.ticketService.isCreatingTicketSubject.next(false));
  }

  //* Display ticket list of the task
  displayTicketList(): void{
    this.router.navigate(['ticketList'], { relativeTo: this.route});
  }
}
