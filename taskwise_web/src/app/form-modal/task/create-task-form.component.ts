import { DatePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProjectTaskGetDTO } from 'src/app/DTOs/ProjectDTO';
import { TaskGetDTO } from 'src/app/DTOs/TaskDTO';
import { ProjectService } from 'src/app/Services/project.service';
import { TaskService } from 'src/app/Services/task.service';
import { UserService } from 'src/app/Services/user.service';
import { UserGetDTO } from 'src/app/modules/auth';
import { AttachmentGetDTO } from 'src/app/DTOs/AttachmentDTO';
import { atLeastOneFieldValidator } from 'src/app/utils/validator';
import { MAXWORKHOUR } from 'src/app/utils/const';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-create-task-form',
  templateUrl: './create-task-form.component.html',
  styleUrls: ['./create-task-form.component.scss'],
  providers: [DatePipe]
})
export class CreateTaskFormComponent implements OnInit{

  DateFormatter = new DateFormatter();
  isLoadingPro$: Observable<boolean>;
  isLoadingTask$: Observable<boolean>;
  isLoadingUser$: Observable<boolean>;
  isMobile: boolean;
  // When creating a task, we need to choose which project the task belongs to
  projectList: ProjectTaskGetDTO[] | undefined;
  engineers: UserGetDTO[] | undefined;
  // Avoid adding the leader as a team member
  filterEngineers: UserGetDTO[] | undefined = [];
  // selectedProject: ProjectTaskGetDTO | undefined;
  projectLeaderId: string;
  projectEngineerList: UserGetDTO[] = [];
  status: String[] = ["Pending", "On Hold", "Completed"];
  priority: String[] = ["Low", "Medium", "High"];
  taskForm: FormGroup;
  hasError: boolean = false;
  filesToDelete: AttachmentGetDTO[] = [];
  NoMatchedEngineer: boolean;
  EmptyRequiredTime: boolean;
  // Used to edit the task details
  @Input() task: TaskGetDTO | undefined;
  @Input() isEditMode: boolean;
  @Output() updateTask = new EventEmitter<TaskGetDTO | undefined>();
  //* Refer to the child component: <app-file-upload></app-file-upload> with template variable
  @ViewChild("fileService") fileService;

  @HostListener("window:resize", ["$event"])
  onResize($event:any){
    this.isMobile= window.innerWidth <= 425 || screen.width <= 425 ? true :false ;
  }
  
  
  constructor
  (
    private fb: FormBuilder,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private datePipe: DatePipe,
    private ToastService: ToastAlertService,
  )
  {
    this.isLoadingTask$ = this.taskService.isLoading$;
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingUser$ = this.userService.isLoading$;
  }

  async ngOnInit(): Promise<void>{
    this.initForm();
    await this.getProjectsForTask();
    await this.getAllEngineers();

    if(this.task){
      // Cast the task due date to the correct format
      this.task.due_date = this.datePipe.transform(this.task.due_date, 'yyyy-MM-dd')!;
      // Patch all the value from the project to the form
      this.taskForm.patchValue(this.task);
      // "attachments" will store File[] rather than AttachmentGetDTO[]
      this.taskForm.get("attachments").setValue([]);
      this.filterEngineer();
    }
    else{
      //* The first project will be the DEFAULT selected project for a task (if NOT updating)
      this.taskForm.get('projectID').setValue(this.projectList[0]._id);
    }
  }

  initForm(): void{
    this.taskForm = this.fb.group({
      name: [
        '',
        Validators.compose([Validators.required])
      ],
      due_date: [
        '',
        Validators.compose([Validators.required])
      ],
      status: [
        this.task ? this.task.status : 'Pending',
        Validators.compose([Validators.required])
      ],
      priority: [
        this.task ? this.task.priority: 'Low',
        Validators.compose([Validators.required])
      ],
      description: [
        '',
        Validators.compose([Validators.required])
      ],
      projectID: [
        '',
        Validators.compose([Validators.required])
      ],
      selectedLeaderID: [
        '',
        Validators.compose([Validators.required])
      ],
      selectedEngineersID: [
        [],
      ],
      attachments: [
        [],
      ],
      day: [],
      hour: [],
      minute: [],
    }, { validators: atLeastOneFieldValidator });
  }

  get projectID(){
    return this.taskForm.get('projectID')?.value;
  }

  get estimatedCompletedHour(){
    return this.DateFormatter.transformToHours(this.taskForm.get('day').value, this.taskForm.get('hour').value, this.taskForm.get('minute').value);
  }

  get selectedLeaderID(){ return this.taskForm.get("selectedLeaderID")?.value; }

  get selectedEngineersID(){ return this.taskForm.get("selectedEngineersID"); }

  //* Get a list of project so that we can choose project for a created task
  async getProjectsForTask(): Promise<void>{
    this.projectList = await this.projectService.getProjectsForTask();
  }
  
  //* Update the form 'attachments' whenever a file is added / deleted
  updateSelectedFiles(files: File[]): void{
    this.taskForm.get("attachments").setValue(files);
  }

  //* Store the "UPLOADED" files to be deleted when "X" is clicked
  deleteUploadedFiles(attachment: AttachmentGetDTO): void{
    this.filesToDelete.push(attachment);
  }

  async getAllEngineers(): Promise<void>{
    // Get all the engineers
    const engineerList = await this.userService.getEngineers();
    //* In case there's any error while retrieving, we display an error message
    if(!engineerList){ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
    else{ this.engineers = engineerList; }
  }

  filterEngineer(){
    let currentSelectedEngineer: string[] = this.selectedEngineersID?.value;
    if(this.engineers){
      // 1. Remove the selected leader from the project's form "selectedEngineerIds"
      this.selectedEngineersID?.setValue(currentSelectedEngineer?.filter((engineerId: string) => engineerId != this.selectedLeaderID));
      // 2. Reset the value of "multiselect" to filter out the project leader
      this.filterEngineers = this.engineers.filter((engineer: UserGetDTO) => engineer._id != this.selectedLeaderID);
    }
  }

  async createTask(): Promise<void>{

    let response = await this.taskService.createTask(this.taskForm.value);

    if(response){ 
      this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve added a task successfully!'); 
      this.taskForm.reset(); 
      this.fileService.clear();
      this.selectedEngineersID.setValue([]);
      await this.getAllEngineers();
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
  }

  async update(){
    //* 1. Update the task details (Exclude "attachments" to be deleted)
    let updatedTask = await this.taskService.updateTask(this.taskForm.value, `${this.task!._id}`);

    //* 2. If there's any attachment to be deleted, delete it and return the latest task
    if(this.filesToDelete.length > 0){
      let response = await this.taskService.deleteTaskAttachment(updatedTask._id, this.filesToDelete);
      if(response){ this.filesToDelete = []; updatedTask = response; }
    }

    if(updatedTask){
      await this.getAllEngineers();
      this.updateTask.emit(updatedTask);
      //* 1. Once uploaded, we should clear the "File[]" (Store the files to be uploaded)
      this.fileService.clear();
      //* 2. Now, the file uploaded will become "AttachmentGetDTO"
      this.fileService.setUploadedFiles(updatedTask.attachments);
      this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve updated successfully!');
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
  }

  //? Automated Task Assignment based on engineer's `currentWorkingHour`
  automatedAssignment(): void {

    //* 1. Execute only IF the `estimated completed time` field is filled in
    if(this.taskForm.getError('atLeastOneRequired')){
      this.EmptyRequiredTime = true;
      return;
    }else{ 
      this.EmptyRequiredTime = false; 
    }

    //* 2. Sort the engineers based on their `currentWorkingHour`
    const sortedEngineers = this.engineers.slice().sort((a, b) => {
      return a.currentWorkingHour - b.currentWorkingHour;
    });

    console.log(sortedEngineers);

    //* IF there's available engineer (ONE ONLY) where his `currentWorkingHour` < MAXWORKHOUR.BASIC, assign the task to the engineer
    for(const engineer of sortedEngineers){
      if(engineer.currentWorkingHour + this.estimatedCompletedHour <= MAXWORKHOUR.BASIC){
        this.taskForm.get('selectedLeaderID').setValue(engineer._id);
        this.NoMatchedEngineer = false;
        this.filterEngineer();
        return;
      }
    }

    //* Display exception message to the user if there's no matching engineers
    this.NoMatchedEngineer = true;
  }
}
