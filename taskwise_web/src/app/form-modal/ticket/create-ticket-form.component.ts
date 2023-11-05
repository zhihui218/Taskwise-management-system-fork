import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService, UserGetDTO } from 'src/app/modules/auth';
import { ProjectTicketGetDTO } from 'src/app/DTOs/ProjectDTO';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketGetDTO } from 'src/app/DTOs/TicketDTO';
import { TICKET_STATUS, PRIORITY, ROLE } from 'src/app/utils/const';
import { DatePipe } from '@angular/common';
import { TicketService } from 'src/app/Services/ticket.service';
import { AttachmentGetDTO } from 'src/app/DTOs/AttachmentDTO';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TaskGetDTO } from 'src/app/DTOs/TaskDTO';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-create-ticket-form',
  templateUrl: './create-ticket-form.component.html',
  styleUrls: ['./create-ticket-form.component.scss'],
  providers: [DatePipe]
})
export class CreateTicketFormComponent implements OnInit {

isLoadingTic$: Observable<boolean>;
isLoadingUser$: Observable<boolean>;
task: TaskGetDTO; //? For "Creating Ticket" for a task
ticketForm: FormGroup;
filesToDelete: AttachmentGetDTO[] = [];
//* Get the projects of the client himself / herself
projectsOfClient: ProjectTicketGetDTO[] | undefined;
projectLeaderId: string;
projectEngineerList: UserGetDTO[] = [];
status: String[] = [TICKET_STATUS.PENDING, TICKET_STATUS.REOPENED, TICKET_STATUS.SOLVED];
priority: String[] = [PRIORITY.LOW, PRIORITY.MEDIUM, PRIORITY.HIGH];
// Used to edit the task details
@Input() ticket: TicketGetDTO | undefined;
// Check whether the user is editing the task details
@Input() isEditMode: boolean;
@Output() updateTicket = new EventEmitter<TicketGetDTO | undefined>();
//* Refer to the child component: <app-file-upload></app-file-upload> with template variable
@ViewChild("fileService") fileService;

constructor
(
  public authService: AuthService,
  private ticketService: TicketService,
  private fb: FormBuilder,
  private datePipe: DatePipe,
  private ToastService: ToastAlertService,
  private config: DynamicDialogConfig
){
  this.isLoadingTic$ =this.ticketService.isLoading$;
  this.task = this.config.data?.task;
}

async ngOnInit(): Promise<void> {
  this.initForm();

  // Load existing ticket (if any)
  if(this.ticket){
    // Cast the task due date to the correct format
    if(this.ticket.due_date) this.ticket.due_date = this.datePipe.transform(this.ticket.due_date, 'yyyy-MM-dd')!;
    // Patch all the value from the project to the form
    this.ticketForm.patchValue(this.ticket);
    // "attachments" will store File[] rather than AttachmentGetDTO[]
    this.ticketForm.get("attachments").setValue([]);
  }
}

initForm(): void{
  this.ticketForm = this.fb.group({
    name: [
      '',
      Validators.compose([Validators.required])
    ],
    client_id: [
      '',
      Validators.compose([Validators.required])
    ],
    status: [
      this.ticket ? this.ticket.status : TICKET_STATUS.PENDING,
      Validators.compose([Validators.required])
    ],
    priority: [
      this.ticket ? this.ticket.priority: PRIORITY.LOW,
      Validators.compose([Validators.required])
    ],
    description: [
      '',
      Validators.compose([Validators.required])
    ],
    // Get from the "Task Details"
    project_id: [''],
    task_id: [''],
    selectedLeaderID: [''],
    // Optional
    due_date: [''],
    completed_date: [''],
    attachments: [
      [],
    ]
  });
  //? While "CREATING" ticket, retrieve the information of the task directly without going through the API
  if(!this.isEditMode) this.resetProjectTaskEngineers();
}

resetProjectTaskEngineers(): void{
  this.ticketForm.get("client_id").setValue(this.authService.currentUserValue._id);
  this.ticketForm.get("project_id").setValue(this.task.projectID);
  this.ticketForm.get("task_id").setValue(this.task._id);
  this.ticketForm.get("selectedLeaderID").setValue(this.task.selectedLeaderID);
}

//* Update the form 'attachments' whenever a file is added / deleted
updateSelectedFiles(files: File[]): void{
  this.ticketForm.get("attachments").setValue(files);
}

//* Store the "UPLOADED" files to be deleted when "X" is clicked
deleteUploadedFiles(attachment: AttachmentGetDTO): void{
  this.filesToDelete.push(attachment);
}

async createTicket(): Promise<void>{
  let response = await this.ticketService.createTicket(this.ticketForm.value);

  if(response){ 
    this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve added a ticket successfully!');
    this.ticketForm.reset(); 
    this.ticketForm.get('status').setValue(TICKET_STATUS.PENDING);
    this.resetProjectTaskEngineers();
    this.fileService.clear();
    //? Reload the "Task-details" page when the new ticket is created
    this.ticketService.isCreatingTicketSubject.next(true);
  }
  else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
}

async update(){
  //* 1. Update the ticket details (Exclude "attachments" to be deleted)
  let updatedTicket = await this.ticketService.updateTicket(this.ticketForm.value, `${this.ticket!._id}`);

  //* 2. If there's any attachment to be deleted, delete it and return the latest ticket
  if(this.filesToDelete.length > 0){
    let response = await this.ticketService.deleteTicketAttachment(updatedTicket._id, this.filesToDelete);
    if(response){ this.filesToDelete = []; updatedTicket = response; }
  }

  if(updatedTicket){
    this.updateTicket.emit(updatedTicket);
    //* 1. Once uploaded, we should clear the "File[]" (Store the files to be uploaded)
    this.fileService.clear();
    //* 2. Now, the file uploaded will become "AttachmentGetDTO"
    this.fileService.setUploadedFiles(updatedTicket.attachments);
    this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve updated successfully!');
  }
  else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
}
}
