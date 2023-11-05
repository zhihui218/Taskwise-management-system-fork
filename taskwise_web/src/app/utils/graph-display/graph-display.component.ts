import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChartService } from 'src/app/Services/chart.service';

@Component({
  selector: 'app-graph-display',
  templateUrl: './graph-display.component.html',
  styleUrls: ['./graph-display.component.scss']
})
export class GraphDisplayComponent implements OnInit {

  @Input() title: string;
  @Input() dataToDisplay: any;
  @Output() getData: EventEmitter<string> = new EventEmitter<string>();
  timeFrame: string[] = ['This Week', 'This Month', 'This Year'];
  timeFrameModel: string = this.timeFrame[1];
  chart: any;

  constructor
  (
    private chartService: ChartService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(){}

  // filterList(element_id: string){}

  retrieveData(): void{
    this.getData.emit(this.timeFrameModel);
  }

  //* For "TASK DISTRIBUTION" Section
  createLineChart(x_axis_label: string[], data: number[]): void{
    //* Destroy the previous chart before creating the new one
    if(this.chart) this.chart.destroy();
    this.chart = this.chartService.createLineChart("task-distribution", x_axis_label, data);
  }

  //* For "PROJECT STATUS" && "TICKET STATUS" Section
  createPieChart(type: string, data: any): void{
    if(type == "PROJECT"){
      //* Destroy the previous chart before creating the new one
      if(this.chart) this.chart.destroy();
      this.chart = this.chartService.createDashboardPieChart("project-distribution", data, "PROJECT");
    }
    else if(type == "TICKET"){
      //* Destroy the previous chart before creating the new one
      if(this.chart) this.chart.destroy();
      this.chart = this.chartService.createDashboardPieChart("ticket-distribution", data, "TICKET")
    }
  }

  // createBarChart(): void{
  //   this.chart = this.chartService.createBarChart("overview-distribution", this.dateFormatter.monthDate, this.thisWeekOverview);
  // }
}
