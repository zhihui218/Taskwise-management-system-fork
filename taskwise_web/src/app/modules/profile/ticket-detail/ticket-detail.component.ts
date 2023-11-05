import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';
import { ProjectService } from 'src/app/Services/project.service';
import { TicketService } from 'src/app/Services/ticket.service';
import { UserService } from 'src/app/Services/user.service';
import { TicketGetDTO } from 'src/app/DTOs/TicketDTO';
import { COMPANY, PRIORITY, TICKET_STATUS, COMPANY_LOGO, alignTitleTextCenter, setFontSizeAndType } from 'src/app/utils/const';
import { AuthService, UserGetDTO } from '../../auth';
// import { ProjectEngineerGetDTO } from 'src/app/DTOs/ProjectDTO';
import { FormBuilder, FormGroup } from '@angular/forms';
//? Required for issue ticket report generation
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RealTimeService } from 'src/app/Services/real-time.service';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss'],
  providers: [ConfirmationService, DatePipe]
})
export class TicketDetailComponent implements OnInit, OnDestroy{
  isEditMode: boolean = false;
  //* Used to toggle form for "Assignee" and "Due Date" for "engineer / manager"
  isEditDateAndAssignee: boolean = false;
  //* When "Manager / Engineer" wants to choose assignee, it needs to load all the engineers of the project which the ticket related to
  // projectEngineerList: ProjectEngineerGetDTO | undefined;
  isLoadingPro$: Observable<boolean>;
  isLoadingTic$: Observable<boolean>;
  isLoadingUser$: Observable<boolean>;
  ticket: TicketGetDTO | undefined;
  TICKET_STATUS = TICKET_STATUS;
  PRIORITY = PRIORITY;
  isDeleting: boolean = false;
  isClient: boolean;
  //? Check whether the [contactPerson] is online
  isOnline: boolean;
  engineerForm: FormGroup;
  resizeChat: boolean;
  @ViewChild("op") op: any;
  @HostListener("window:resize", ['$event'])
  onResize(event: any){
    if(window.innerWidth < 500 || screen.width < 500) this.resizeChat = true;
    else this.resizeChat = false;
  }

  constructor
  (
    private location: Location,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private projectService: ProjectService,
    private ticketService: TicketService,
    private ToastService: ToastAlertService,
    private userService: UserService,
    private RealTimeService: RealTimeService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  )
  {
    // //? Reason: "NavigationExtras" object disappear once the navigation is completed (Hence, retrieve at constructor)
    if(window.innerWidth < 500 || screen.width < 500) this.resizeChat = true;
    else this.resizeChat = false;
    this.isLoadingPro$ = this.projectService.isLoading$;
    this.isLoadingTic$ = this.ticketService.isLoading$;
    this.isLoadingUser$ = this.userService.isLoading$;
    this.isClient = this.authService.isClient();
  }

  async ngOnInit(): Promise<void> {
    //? Catch when the 'ticketId' param changes
    this.route.paramMap.subscribe(async(params) => {
      this.initForm();

      //* 2. Get the ticket id 
      const ticketId = params.get('ticketId')!;

      //* 3. Get information of the ticket (ONLY when page refresh)
      await this.getTicketDetails(ticketId);

      //* 4. Get the details of client of the ticket if the current user != a client
      const client: UserGetDTO = await this.userService.getUserById(this.ticket.client_id);
      this.ticket.client = client;

      // //* 5. Get the engineers of the ticket ("CLIENT")
      // if(this.isClient) this.isOnline = await this.userService.checkUserStatus(this.ticket.selectedLeader._id);
      // else this.isOnline = await this.userService.checkUserStatus(this.ticket.client._id);

      // Cast the task due date to the correct format
      if(this.ticket.due_date) this.ticket.due_date = this.datePipe.transform(this.ticket.due_date, 'yyyy-MM-dd')!;
      this.engineerForm.patchValue(this.ticket);
    })
  }

  //? Display the chat overlay panel with different size dynamically
  getOverlayChatWidth(): any{
    if(this.resizeChat) return { width: '300px' };
    else return { width: '500px' };
  }

  initForm(): void{
    this.engineerForm = this.fb.group(
      {
        due_date: [''],
      }
    )
  }

  async getTicketDetails(ticketId: string): Promise<void>{
    // 1. Get the details of specific ticket
    this.ticket = await this.ticketService.getTicketDetails(ticketId);

    if(this.ticket){
      // 2. Get the name of the project which the ticket belongs to
      const { name } = await this.projectService.getProjectNameAndLeader(this.ticket.project_id);
      this.ticket.project_name = name;
    }
  }

  //* Invoked by "CLIENT" to update his / her ticket
  async updateTicket(ticket: TicketGetDTO | undefined): Promise<void>{
    const leader: UserGetDTO = this.ticket.selectedLeader;
    // Update the original ticket value with latest updated ticket
    this.ticket = {
      task_name: this.ticket.task_name,
      ...ticket
    };
    const { name } = await this.projectService.getProjectNameAndLeader(this.ticket.project_id);
    this.ticket.project_name = name;
    this.ticket.selectedLeader = leader;
  }

 //* Although a ticket has "Pending / Reopened / Solved" in status, we will toggle between "Solved" AND "Reopened" status
  async updateTicketStatus(): Promise<void>{
    // To toggle the task status between "Solved" AND "Reopened"
    const status = this.ticket.status == TICKET_STATUS.PENDING || this.ticket.status == TICKET_STATUS.REOPENED ? TICKET_STATUS.SOLVED : TICKET_STATUS.REOPENED;
    const updatedTicket: TicketGetDTO | undefined = await this.ticketService.updateTicketStatus(this.ticket._id, status);
    
    if(updatedTicket){ 
      this.ticket = {
        ...updatedTicket,
        project_name: this.ticket?.project_name,
        task_name: this.ticket?.task_name,
        client: this.ticket?.client,
        selectedLeader: this.ticket.selectedLeader,

      }
    }
    else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!') }
  }

  async toggleEditDateAndAssignee(): Promise<void>{ 
    this.isEditDateAndAssignee = !this.isEditDateAndAssignee;
    //* When it changes from "true" -> "false": Editing is completed
    if(!this.isEditDateAndAssignee) await this.updateTicketDueAndEng();
  }

  //* Used by "MANAGER || ENGINEER" to update ticket's due date & assignees
  async updateTicketDueAndEng(): Promise<void>{
    let res = await this.ticketService.updateTicketDueAndEng(this.ticket._id, this.engineerForm.value);

    //* If it's updated successfully, update the current ticket as well
    if(res){
      this.ticket.due_date = this.engineerForm.get("due_date").value;
      this.ToastService.invokeToastAlert('success', 'Success', 'Due Date is updated!');
    }
  }

  async openConfirmationDialog(): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        this.isDeleting = true;
        const isSuccess = await this.deleteTicket(); 
        this.isDeleting = false;
        if(isSuccess){
          this.ToastService.invokeToastAlert('success', 'Success', 'You\'ve delete the ticket successfully!');
          this.goBack();
        }
        else{ this.ToastService.invokeToastAlert('error', 'Error', 'Unexpected error occurs, please try again!'); }
      },
      reject: () => {}
    })
  }

  async deleteTicket(): Promise<boolean>{
    if(this.ticket){
      //* Delete all the "UPLOADED" files of the ticket (The folder can only be deleted IF it's EMPTY)
      await this.ticketService.deleteTicketAttachment(this.ticket._id, this.ticket.attachments);
      
      const result = await this.ticketService.deleteTicket(this.ticket._id);
      return result;
    }
    return true;
  }

  goBack(): void { this.location.back(); }

  toggleEditMode(): void { this.isEditMode = !this.isEditMode; }

  enterChatRoom(): void{
    this.RealTimeService.enterChatRoom(this.authService.currentUserValue._id, this.ticket._id);
  }

  leaveChatRoom(): void{
    this.RealTimeService.leaveChatRoom(this.authService.currentUserValue._id);
  }

  ngOnDestroy(): void { this.leaveChatRoom(); }

  //? Generate an issue ticket report regardless of its status
  async generateTicketReport(): Promise<void>{
    // Initiate a pdf template
    const pdf = new jsPDF('p', 'mm', 'a4');
    setFontSizeAndType(pdf, 'times', 'bold', 14);

    // Display the company logo on the report
    const logoWidth = 25;
    const logoHeight = 15;
    pdf.addImage(COMPANY_LOGO, 'PNG', 15, 2.5, logoWidth, logoHeight);

    // Add the title at the top of the page
    alignTitleTextCenter(pdf, 'Issue Ticket Report', 10, true, 9);
    setFontSizeAndType(pdf, 'times', 'normal', 8.5);
    alignTitleTextCenter(pdf, `Created on: ${ this.datePipe.transform(new Date(), 'd MMMM yyyy' )}`, 15);

    // First table (3 x 2) for company details
    const company_data: string[][] = [
      ['Company:', `${COMPANY} Sdn Bhd`],
      ['Project:', `${ this.ticket.project_name }`],
      ['Task:', `${ this.ticket.task_name }`],
      ['Main Contact Person:', `${ this.ticket.selectedLeader.name } (${this.ticket.selectedLeader.email})`],
    ];
    this.generateTable(pdf, company_data);

    // Second table (3 x 3) for issuer and ticket ID
    const ticket_data: string[][] = [
      ['Client:', `${ this.ticket.client?.company_name || '-'}`],
      ['Issuer:', `${ this.ticket.client.name }`],
      ['Ticket No:', `${ (this.ticket._id).toUpperCase() }`],
    ];
    this.generateTable(pdf, ticket_data, 10);

    // Title "Ticket Details" with specified font
    setFontSizeAndType(pdf, 'times', 'bold', 14);
    pdf.text('Ticket Details', 15, (pdf as any).lastAutoTable.finalY + 20);

    // Third table (8 x 2) for ticket details
    const ticket_details: string[][] = [
      ['Issue:', `${ this.ticket.name }`],
      ['Description:', `${ this.ticket.description }`],
      ['Priority:', `${ this.ticket.priority }`],
      ['Status:', `${ this.ticket.status }`],
      ['Raised by:', `${ this.datePipe.transform(this.ticket.created_date, 'd MMMM yyyy') }`],
      ['Due Date:', `${ this.ticket?.due_date ? this.datePipe.transform(this.ticket?.due_date, 'd MMMM yyyy') : 'N/A' }`],
      ['Closed On:', `${ this.ticket?.completed_date ? this.datePipe.transform(this.ticket?.completed_date, 'd MMMM yyyy') : 'N/A' }`],
  ];
    this.generateTable(pdf, ticket_details, 25);

    // Output PDF to be viewed in the browser
    pdf.output('dataurlnewwindow', { filename: `Ticket Report (${this.ticket._id.toUpperCase()})`});
  }

  //* Display ticket list of the task
  displayTicketList(): void{
    this.router.navigate(['ticketList'], { relativeTo: this.route});
  }

  private generateTable(pdf: any, data: string[][], extraY: number = 0): void{
    const y_coordinate = (pdf as any).lastAutoTable.finalY;
    
    autoTable(pdf, {
      head: [],
      body: data,
      theme: 'grid',
      startY: y_coordinate ? y_coordinate + extraY : 25,
      columnStyles: {
        0: { cellWidth: 30, fillColor: [255, 248, 221], fontStyle: 'bold' }, // Apply yellow color to the first column
      },
      didParseCell: (data) => { data.cell.styles.font = 'times'; },
    });
  }
}
