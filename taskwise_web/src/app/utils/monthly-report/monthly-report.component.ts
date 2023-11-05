import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
//? Required for 'PDF' generator
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { DashboardService } from 'src/app/Services/dashboard.service';
import { Observable } from 'rxjs';
import { COMPANY, pdfSettings } from '../const';
import { ChartService } from 'src/app/Services/chart.service';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { TYPE, TICKET_STATUS, STATUS, PRIORITY } from '../const';
import { ProjectReportDTO } from 'src/app/DTOs/ProjectDTO';
import { TicketReportDTO } from 'src/app/DTOs/TicketDTO';
import { TaskReportDTO } from 'src/app/DTOs/TaskDTO';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-monthly-report',
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.scss'],
  providers:[DatePipe]
})
export class MonthlyReportComponent implements OnInit {

  COMPANY = COMPANY; TYPE = TYPE; STATUS = STATUS; TICKET_STATUS = TICKET_STATUS; PRIORITY = PRIORITY;
  dateFormatter: DateFormatter = new DateFormatter();
  isLoadingPdf$: Observable<boolean>;
  isMobile: boolean;
  @Input() thisMonthProject; project_chart: any;
  @Input() thisMonthTask; line_chart: any;
  @Input() thisMonthTicket; ticket_chart: any;
  projects: ProjectReportDTO[];
  tasks: TaskReportDTO[];
  tickets: TicketReportDTO[];

  @HostListener('window: resize', ['$event']) 
  onResize(event: any){
    if(window.innerWidth <= 930 || screen.width <= 930){
      this.isMobile = true;
    }
    else{
      this.isMobile = false;
    }
  }

  constructor
  (
    private DashboardService: DashboardService,
    private ChartService: ChartService,
    private datePipe: DatePipe
  )
  { this.isLoadingPdf$ = this.DashboardService.isLoadingPdf$; }

  async ngOnInit(): Promise<void> {
    if(window.innerWidth <= 930 || screen.width <= 930) this.isMobile = true;
    else this.isMobile = false;

    //? 1. Calculate the percentage of "Pending", "On Hold", and "Completed" task by combining each day of the month
    this.calculateProgress(this.thisMonthTask);

    //? 2. Draw all the relevant charts
    this.project_chart = this.ChartService.createDashboardPieChart("project", this.thisMonthProject, "PROJECT", true);
    this.line_chart = this.ChartService.createLineChart("task",  this.dateFormatter.monthDate, this.thisMonthTask, true);
    this.ticket_chart = this.ChartService.createDashboardPieChart("ticket", this.thisMonthTicket, "TICKET", true);

    //? 3. Get the "Project", "Task", "Ticket" tables ready
    this.projects = await this.DashboardService.getAll(TYPE.PROJECT);
    this.tasks = await this.DashboardService.getAll(TYPE.TASK);
    this.tickets = await this.DashboardService.getAll(TYPE.TICKET);

    await this.generateMonthlyReport();
  }

  async generateMonthlyReport(): Promise<void> {

    let data: any = document.getElementById('content');
    //? Render the report nicely in mobile version
    if(this.isMobile && data){
      const viewportMetaTag = document.querySelector('meta[name="viewport"]');
      viewportMetaTag.setAttribute('content', '');
      setTimeout(async () => {
        await this.downloadPdf(true, viewportMetaTag, data);
      }, 3);
    }else{
      await this.downloadPdf(false,null, data);
    }
  }

  private async downloadPdf(isMobile = false, viewportMetaTag = null, canvasData = null): Promise<void> {

    const { projectColumnName, projectRowData, projectFooterData } = this.transformProjectData(this.projects);
    const { taskColumnName, taskRowData, taskFooterData } = this.transformTaskData(this.tasks);
    const { ticketColumnName, ticketRowData, ticketFooterData } = this.transformTicketData(this.tickets);

    html2canvas(canvasData).then(async (canvas) => {
      
      canvas.getContext("2d", { willReadFrequently: true })

        // 1. Get the necessary `jsPDF` settings
        const { imgWidth, imgHeight, position } = pdfSettings(canvas);

        // 2. Get the canvas content as an image
        const imgData = canvas.toDataURL('image/png');
  
        // Create a PDF with jsPDF
        const pdf = new jsPDF('p', 'mm', 'a4');
  
        // 4. Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.addPage();
        pdf.setFont('times', 'bold');

        //? Monthly Project List Table
        const project_x: number = 15; const project_y: number = 10;
        this.drawTable(pdf, "Monthly Project List", project_x, project_y, projectColumnName, projectRowData, projectFooterData, TYPE.PROJECT);

        //? Monthly Task List Table
        const task_x: number = 15; const task_y: number = (pdf as any).lastAutoTable.finalY + 10;
        this.drawTable(pdf, "Monthly Task List", task_x, task_y, taskColumnName, taskRowData, taskFooterData, TYPE.TASK);

        //? Monthly Ticket List Table
        const ticket_x: number = 15; const ticket_y: number = (pdf as any).lastAutoTable.finalY + 10;
        this.drawTable(pdf, "Monthly Ticket List", ticket_x, ticket_y, ticketColumnName, ticketRowData, ticketFooterData, TYPE.TICKET);

        await pdf.save(`${ COMPANY } Monthly Report.pdf`, { returnPromise: true }).then(() => {
          // Code will be executed after save
          this.DashboardService.isGeneratingPdf(false);
        });
        if(isMobile){
            setTimeout(() => {
              viewportMetaTag.setAttribute('content', 'width=device-width, initial-scale=1');
            }, 0);
          }
      });
  }

  private drawTable(pdf: any, title: string, x: number,  y: number, headColumn: string[][], rowData: string[][], footColumn: any[][], model_type: string){
    pdf.text(title, x, y);
    pdf.line(x, y + 1, x + pdf.getTextWidth(title), y + 1);

    autoTable(pdf, {
      theme: 'plain',
      head: headColumn,
      body: rowData,
      foot: footColumn,
      headStyles: { fillColor: [255, 248, 221], textColor:'black', fontSize: 8, halign: 'center', valign: 'middle' },
      footStyles: { fillColor: [255, 248, 221],  fontSize: 12, },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
      },
      didParseCell: (data) => { data.cell.styles.font = 'times'; },
      didDrawCell: (data) => {
        if (data.row.index >= 0) { // Skip header row
          const cell = data.cell;
          pdf.setLineWidth(0.1); // Set border width
          pdf.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height); // Draw border at the bottom of each cell
        }
      },
      startY: y + 3,
      //? When there's a page break, avoid displaying the "header" && "footer" repeatedly
      showFoot: 'lastPage',
      showHead: 'firstPage'
    })
  }

  //Calculate the progress && append the result to the "thisMonthTask"
  private calculateProgress(thisMonthTask: any): void{
    let pendingAmount: number = 0;
    let onHoldAmount: number = 0;
    let completedAmount: number = 0;
    for(let i = 0; i < thisMonthTask[STATUS.PENDING].length; i++) pendingAmount += thisMonthTask[STATUS.PENDING][i];
    for(let i = 0; i < thisMonthTask[STATUS.ONHOLD].length; i++) onHoldAmount += thisMonthTask[STATUS.ONHOLD][i];
    for(let i = 0; i < thisMonthTask[STATUS.COMPLETED].length; i++) completedAmount += thisMonthTask[STATUS.COMPLETED][i];

    thisMonthTask['pendingAmount'] = pendingAmount;
    thisMonthTask['onHoldAmount'] = onHoldAmount;
    thisMonthTask['completedAmount'] = completedAmount;
    thisMonthTask['pendingPercent'] = parseFloat(((pendingAmount / thisMonthTask['Total']) * 100).toFixed(1));
    thisMonthTask['onHoldPercent'] = parseFloat(((onHoldAmount / thisMonthTask['Total']) * 100).toFixed(1));
    thisMonthTask['completedPercent'] = parseFloat(((completedAmount / thisMonthTask['Total']) * 100).toFixed(1));
  }

  private transformProjectData(projects: ProjectReportDTO[]){
    const projectColumnName = [ ['Name', 'Deadline', 'Task Progress', 'Ticket Progress', 'Status', 'Priority'] ];
    const projectRowData = [];

    let totalOfOverdue: number = 0;

    for(const project of projects){
      const projectDetails: any[] = [];
      const formattedDate = this.datePipe.transform(project.due_date, 'd MMM yyyy');
      //? Check how many overdue project (As footer for analysis)
      const isOverdue = project.status != STATUS.COMPLETED && this.dateFormatter.isOverdue(project.due_date) ? true : false;
      if(isOverdue) totalOfOverdue++;

      projectDetails.push
      (
        project.name,
        isOverdue ? { content: formattedDate, styles: { textColor: '#CD6688', fontWeight: 'bold' } } : formattedDate,
        project?.task_completed_percent ? project?.task_completed_percent + '%' : project?.task_completed_percent == 0 ? 0 + '%' : 'No task', 
        project?.ticket_completed_percent ? project?.ticket_completed_percent + '%' : project?.ticket_completed_percent == 0 ? 0 + '%' : 'No issue ticket',
        project.status,
        project.priority, 
      )
      projectRowData.push(projectDetails);
    }

    //? Format the footer data
    const projectFooterData = this.generateFooterText(totalOfOverdue, "project");
    return { projectColumnName, projectRowData, projectFooterData };
  }

  private transformTaskData(tasks: TaskReportDTO[]){
    const taskColumnName = [ ['Name', 'Deadline', 'Status', 'Priority', 'Main Contact Person', 'Other Members'] ];
    const taskRowData = [];

    let totalOfOverdue: number = 0;

    for(const task of tasks){
      const taskDetails: any[] = [];
      const formattedDate = this.datePipe.transform(task.due_date, 'd MMM yyyy');
      //? Check how many overdue project (As footer for analysis)
      const isOverdue = task.status != STATUS.COMPLETED && this.dateFormatter.isOverdue(task.due_date) ? true : false;
      if(isOverdue) totalOfOverdue++;
      taskDetails.push
      (
        task.name,
        isOverdue ? { content: formattedDate, styles: { textColor: '#CD6688', fontWeight: 'bold' } } : formattedDate,
        task.status, 
        task.priority,
        task.selectedLeader.name,
        task.selectedEngineersID.length
      )
      taskRowData.push(taskDetails);
    }

    //? Format the footer data
    const taskFooterData = this.generateFooterText(totalOfOverdue, "task");
    return { taskColumnName, taskRowData, taskFooterData };
  }

  private transformTicketData(tickets: TicketReportDTO[]){
    const ticketColumnName = [ ['Name', 'Issued By', 'Created Date', 'Deadline', 'Status', 'Priority', 'Assignee'] ];
    const ticketRowData = [];

    let totalOfOverdue: number = 0;

    for(const ticket of tickets){
      const ticketDetails: any[] = [];
      //? Check how many overdue project (As footer for analysis)
      const isOverdue = ticket.status != STATUS.COMPLETED && ticket?.due_date && this.dateFormatter.isOverdue(ticket.due_date) ? true : false;
      if(isOverdue) totalOfOverdue++;
      ticketDetails.push
      (
        ticket.name,
        ticket.client.name,
        this.datePipe.transform(ticket.created_date, 'd MMM yyyy'), 
        isOverdue ? { content: this.datePipe.transform(ticket.due_date, 'd MMM yyyy'), styles: { textColor: '#CD6688', fontWeight: 'bold' } } : ticket?.due_date ? this.datePipe.transform(ticket.due_date, 'd MMM yyyy') : 'N/A', 
        ticket.status, 
        ticket.priority, 
        ticket.selectedLeader.name
      )
      ticketRowData.push(ticketDetails);
    }

    //? Format the footer data
    const ticketFooterData = this.generateFooterText(totalOfOverdue, "ticket");
    return { ticketColumnName, ticketRowData, ticketFooterData };
  }

  private generateFooterText(overdueNum: number, model_type: string){
    return overdueNum > 0 
    ? 
    [[
        { content: `From ${this.datePipe.transform(this.dateFormatter.startDayOfMonth, 'd MMM yyy')} to ${this.datePipe.transform(this.dateFormatter.today, 'd MMM yyy')}, there're ${overdueNum} overdue ${model_type}(s).`, colSpan: model_type == "ticket" ? 7 : 6 }
    ]]
    :
    [[
      { content: `Congratulations! There're no overdue ${model_type}.`, colSpan: model_type == "ticket" ? 7 : 6 }
    ]]
  }
}
