import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ChartService } from 'src/app/Services/chart.service';
import { DashboardService } from 'src/app/Services/dashboard.service';
import { TYPE, ROLE } from 'src/app/utils/const';
import { DateFormatter } from 'src/app/utils/DateConverter';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  TYPE = TYPE; ROLE = ROLE;
  dateFormatter: DateFormatter = new DateFormatter();
  timeFrame: string[] = ['This Week', 'This Month', 'This Year'];
  //* ngModel (By Default display "This Month" data )
  timeFrameTask: string = this.timeFrame[1];
  timeFramePro: string = this.timeFrame[1];
  timeFrameTic: string = this.timeFrame[1];

  //? Data for <app-first-card></app-first-card>
  projects: any; tasks: any; tickets: any;
  //? Data for <app-second-card></app-second-card>
  numOfClient: number; numOfEngineer: number;
  //? Data for <canvas id="workload-bar-chart"></canvas>
  weeklyWorkload: any;
  //? Data for <canvas id="task-distribution"></canvas> "Line Graph"
  thisYearTask: any; thisMonthTask: any; thisWeekTask: any;
  //? Data for <canvas id="project-distribution"></canvas> "Pie Chart"
  thisYearPro: any; thisMonthPro: any; thisWeekPro: any;
  //? Data for <canvas id="ticket-distribution"></canvas> "Pie Chart"
  thisYearTic: any; thisMonthTic: any; thisWeekTic: any;
  //? 'Chart' objects created
  weekly_bar_chart: any; line_chart: any; project_pie_chart: any; ticket_pie_chart: any;
  @ViewChild("task_chart") task_chart: ElementRef;
  @ViewChild("project_chart") project_chart: ElementRef;
  @ViewChild("ticket_chart") ticket_chart: ElementRef;
  @ViewChild("workload_bar") workload_bar: ElementRef;

  @ViewChild('monthly_report') monthly_report: any;
  isLoadingPdf$: Observable<boolean>;
  isLoading: boolean = false;
  
  constructor
  (
    public authService: AuthService,
    private DashboardService: DashboardService,
    private chartService: ChartService,
    private cdr: ChangeDetectorRef
  ) 
  {
    this.isLoadingPdf$ = this.DashboardService.isLoadingPdf$;
  }

  async ngOnInit(): Promise<void> {
    if(this.authService.isManager()){
      await this.getOverallCount();
      await this.getClientAndEngineerCount();
    }
    this.isLoading = true;
    // 1. Get data for "Task Distribution" analysis
    if(!this.authService.isClient()) await this.getTaskAnalysis();
    if(!this.authService.isEngineer()) await this.getProjectAnalysis();
    if(this.authService.isEngineer()) await this.getWeeklyWorkload();
    await this.getTicketAnalysis();
    this.isLoading = false;
    //? Draw the charts after all the data is loaded
    this.cdr.detectChanges();
    this.generateCharts();
  }

  generateCharts(): void{
    //* Display the "Weekly Workload" bar chart for the engineer that log in
    if(this.weeklyWorkload) this.createBarChart("workload-bar-chart", this.weeklyWorkload);
    //* Default, we display "THIS MONTH" projects
    if(this.thisMonthPro) this.createPieChart("PROJECT", this.thisMonthPro);
    //* Default, we display "THIS MONTH" tickets
    if(this.thisMonthTic) this.createPieChart("TICKET", this.thisMonthTic);
    //* Default, we display "THIS MONTH" tasks
    if(this.thisMonthTask) this.createLineChart(this.dateFormatter.monthDate, this.thisMonthTask);
  }

  //? Retrieve <app-first-card></app-first-card> data
  async getOverallCount(): Promise<void>{
    const result = await this.DashboardService.countOverall();

    if(result){
      const { projects, tasks, tickets } = result;

      this.projects = projects;
      this.tasks = tasks;
      this.tickets = tickets;

      //* Update the UI
      this.cdr.detectChanges();
    }
  }

  //? Retrieve <app-second-card></app-second-card> data
  async getClientAndEngineerCount(): Promise<void> {
    const result = await this.DashboardService.countClientAndEngineer();

    if(result){
      this.numOfClient = result['numOfClient'];
      this.numOfEngineer = result['numOfEngineer'];

      //* Update the UI
      this.cdr.detectChanges();
    }
  }

  async getWeeklyWorkload(): Promise<void>{
    const result = await this.DashboardService.getWeeklyWorkload(this.authService.currentUserValue._id);

    if(result) this.weeklyWorkload = result;
  }

  //? Retrieve <canvas id="task-distribution"></canvas> "Line Graph" data
  async getTaskAnalysis(): Promise<void>{
    const result = await this.DashboardService.getTasksDistribution();

    if(result){
      const { yearResult, currentMonthResult, currentWeekResult } = result;
      this.thisYearTask = yearResult;
      this.thisMonthTask = currentMonthResult;
      this.thisWeekTask = currentWeekResult;
    }
  }

  //? Retrieve <canvas id="project-distribution"></canvas> "Pie Graph" data
  async getProjectAnalysis(){
    const result = await this.DashboardService.getPieDistribution(TYPE.PROJECT);

    if(result){
      const { yearResult, currentMonthResult, currentWeekResult } = result;
      this.thisYearPro = yearResult;
      this.thisMonthPro = currentMonthResult;
      this.thisWeekPro = currentWeekResult;
    }
  }

  //? Retrieve <canvas id="ticket-distribution"></canvas> "Pie Graph" data
  async getTicketAnalysis(){
    const result = await this.DashboardService.getPieDistribution(TYPE.TICKET);

    if(result){
      const { yearResult, currentMonthResult, currentWeekResult } = result;
      this.thisYearTic = yearResult;
      this.thisMonthTic = currentMonthResult;
      this.thisWeekTic = currentWeekResult;
    }
  }

  //? Display graph data conditionally based on "This Week", "This Month", "This Year" selection
  filterList(graph_id: string): void{
    //* Redraw the "Line Graph" for "Task Distribution"
    if(graph_id == 'task-distribution'){
      const x_axis_label = this.timeFrameTask == "This Week" ? this.dateFormatter.weekDate : this.timeFrameTask == "This Month" ? this.dateFormatter.monthDate : this.dateFormatter.yearDate;
      const dataToDisplay = this.timeFrameTask == "This Week" ? this.thisWeekTask : this.timeFrameTask == "This Month" ? this.thisMonthTask : this.thisYearTask;
      this.createLineChart(x_axis_label, dataToDisplay);
    }
    //* Redraw the "Pie Chart" for "Project Distribution"
    else if(graph_id == 'project-distribution'){
      const dataToDisplay = this.timeFramePro == "This Week" ? this.thisWeekPro : this.timeFramePro == "This Month" ? this.thisMonthPro : this.thisYearPro;
      this.createPieChart("PROJECT", dataToDisplay);
    }    
    //* Redraw the "Pie Chart" for "Ticket Distribution"
    else if(graph_id == 'ticket-distribution'){
      const dataToDisplay = this.timeFrameTic == "This Week" ? this.thisWeekTic : this.timeFrameTic == "This Month" ? this.thisMonthTic : this.thisYearTic;
      this.createPieChart("TICKET", dataToDisplay);
    }
  }

  //* For "TASK DISTRIBUTION" Section
  createLineChart(x_axis_label: string[], data: number[]): void{
    //* Destroy the previous chart before creating the new one
    if(this.line_chart) this.line_chart.destroy();
    if(this.task_chart) this.line_chart = this.chartService.createLineChart("task-distribution", x_axis_label, data);
  }

  //* For "WEEKLY WORKLOAD" Section
  createBarChart(htmlId: string, weekly_workload: any): void{
    if(this.weekly_bar_chart) this.weekly_bar_chart.destroy();
    if(this.workload_bar) this.weekly_bar_chart = this.chartService.createBarChart(htmlId, Object.keys(weekly_workload), Object.values(weekly_workload));
  }
  //* For "PROJECT STATUS" && "TICKET STATUS" Section
  createPieChart(type: string, data: any): void{
    if(type == "PROJECT"){
      //* Destroy the previous chart before creating the new one
      if(this.project_pie_chart) this.project_pie_chart.destroy();
      if(this.project_chart) this.project_pie_chart = this.chartService.createDashboardPieChart("project-distribution", data, "PROJECT");
    }
    else if(type == "TICKET"){
      //* Destroy the previous chart before creating the new one
      if(this.ticket_pie_chart) this.ticket_pie_chart.destroy();
      // console.log(this.ticket_chart);
      if(this.ticket_chart) this.ticket_pie_chart = this.chartService.createDashboardPieChart("ticket-distribution", data, "TICKET")
    }
  }

  async generateMonthlyReport(): Promise<void> {
    this.DashboardService.isGeneratingPdf(true);
    // await this.monthly_report.generateMonthlyReport(); 
  }
}
