import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, } from 'rxjs';
import { UserGetDTO } from 'src/app/modules/auth';
import { ProjectGetDTO } from 'src/app/DTOs/ProjectDTO';
import { ProjectService } from 'src/app/Services/project.service';
import { UserService } from 'src/app/Services/user.service';
//* Show failure message for APIs calls
import { AttachmentGetDTO } from 'src/app/DTOs/AttachmentDTO';
import { STATUS, PRIORITY, PROJECT_TYPE } from 'src/app/utils/const';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-create-project-form',
  templateUrl: './create-project-form.component.html',
  styleUrls: ['./create-project-form.component.scss'],
  providers: [DatePipe]
})
export class CreateProjectFormComponent implements OnInit, OnDestroy{

  isLoadingPro$: Observable<boolean>;
  isLoadingUser$: Observable<boolean>;
  engineers: UserGetDTO[] | undefined;
  clients: UserGetDTO[] | undefined;
  type: String[] = [PROJECT_TYPE.NEW_SUPPLY, PROJECT_TYPE.MAINTENANCE_CONTRACT, PROJECT_TYPE.OUT_OF_CONTRACT_SUPPORT, PROJECT_TYPE.OTHERS]
  status: String[] = [STATUS.PENDING, STATUS.ONHOLD, STATUS.COMPLETED];
  priority: String[] = [PRIORITY.LOW, PRIORITY.MEDIUM, PRIORITY.HIGH];
  // Avoid adding the leader as a team member
  filterEngineers: UserGetDTO[] | undefined = [];
  projectForm: FormGroup;
  filesToDelete: AttachmentGetDTO[] = [];
  // Used to edit the project details
  @Input() project: ProjectGetDTO | undefined;
  // Check whether the user is editing the project details
  @Input() isEditMode: boolean;
  @Output() updateProject = new EventEmitter<ProjectGetDTO | undefined>();
  private subscription: Subscription[] = [];
  //* Refer to the child component: <app-file-upload></app-file-upload> with template variable
  @ViewChild("fileService") fileService;

  constructor
  (
    private projectService: ProjectService,
    private userService: UserService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ToastService: ToastAlertService
  )
  {
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingUser$ = this.userService.isLoading$;
  }

  async ngOnInit(): Promise<void> {
    this.initForm();
    // Fetch all the "Engineers && Clients" before creating a project
    await this.getAllClients();

    //* For "UPDATING" a project
    if(this.project){
      // Cast the project due date to the correct format
      this.project.due_date = this.datePipe.transform(this.project.due_date, 'yyyy-MM-dd')!;
      // Patch all the value from the project to the form
      this.projectForm.patchValue(this.project);
      // "attachments" will store File[] rather than AttachmentGetDTO[]
      this.projectForm.get("attachments").setValue([])
    }
  }

  initForm() {
    this.projectForm = this.fb.group({
      client_id: [
        '',
        Validators.compose([Validators.required]),
      ],
      name: [
        '',
        Validators.compose([Validators.required])
      ],
      type: [
        this.project ? this.project.type : PROJECT_TYPE.NEW_SUPPLY,
        Validators.compose([Validators.required])
      ],
      due_date: [
        '',
        Validators.compose([Validators.required])
      ],
      status: [
        this.project ? this.project.status : STATUS.PENDING,
        Validators.compose([Validators.required])
      ],
      priority: [
        this.project ? this.project.priority : PRIORITY.LOW,
        Validators.compose([Validators.required])
      ],
      description: [
        '',
        Validators.compose([Validators.required])
      ],
      attachments: [
        [],
      ]
    });
  }

  //* Update the form 'attachments' whenever a file is added / deleted
  updateSelectedFiles(files: File[]): void{
    this.projectForm.get("attachments").setValue(files);
  }

  //* Store the "UPLOADED" files to be deleted when "X" is clicked
  deleteUploadedFiles(attachment: AttachmentGetDTO): void{
    this.filesToDelete.push(attachment);
  }

  async getAllClients(): Promise<void>{
    // Get all the clients
    const clientList = await this.userService.getClients();
    //* In case there's any error while retrieving, we display an error message
    if(!clientList){ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
    else{ this.clients = clientList; }
  }

  async createProject(){
    let response = await this.projectService.createProject(this.projectForm.value);

    if(response){ 
      this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve added a project successfully!');
      this.projectForm.reset(); 
      this.fileService.clear();
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
  }

  async update(){
    //* 1. Update the project details (Exclude "attachments" to be deleted)
    let updatedProject = await this.projectService.updateProject(this.projectForm.value, `${this.project!._id}`);

    //* 2. If there's any attachment to be deleted, delete it and return the latest project
    if(this.filesToDelete.length > 0){
      let response = await this.projectService.deleteProjectAttachment(updatedProject._id, this.filesToDelete);
      if(response){ this.filesToDelete = []; updatedProject = response; }
    }

    if(updatedProject){
      this.updateProject.emit(updatedProject);
      //* 1. Once uploaded, we should clear the "File[]" (Store the files to be uploaded)
      this.fileService.clear();
      //* 2. Now, the file uploaded will become "AttachmentGetDTO"
      this.fileService.setUploadedFiles(updatedProject.attachments);
      this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve updated successfully!');
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
  }

  ngOnDestroy(): void {
    this.subscription.forEach((subscription) => subscription.unsubscribe);
  }
}
