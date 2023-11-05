import { Component, ElementRef, HostBinding, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { getCSSVariableValue } from 'src/app/_metronic/kt/_utils';
import { EngineerRemarkAndKPI } from 'src/app/modules/auth';
import { ChartService } from 'src/app/Services/chart.service';
import { KPI_DISTRIBUTION, PERFORMANCE_RATING } from 'src/app/utils/const';
import { DateFormatter } from 'src/app/utils/DateConverter';

@Component({
  selector: 'app-card3',
  templateUrl: './card3.component.html',
})
export class Card3Component implements OnInit {
  KPI_DISTRIBUTION = KPI_DISTRIBUTION;
  PERFORMANCE_RATING = PERFORMANCE_RATING;
  DateFormatter = new DateFormatter();
  @Input() color: string = '';
  @Input() avatar: string = '';
  @Input() online: boolean = false;
  @Input() name: string = '';
  @Input() job: string = '';
  @Input() avgEarnings: string = '';
  @Input() totalEarnings: string = '';
  @Input() engineerRemarkAndKPI: EngineerRemarkAndKPI;
  @ViewChild("workload_bar") workload_bar: ElementRef;
  bar_chart: any;
  @HostBinding('class') class = 'card';
  isMobile: boolean;
  @HostListener('window:resize', ['$event'])
  onResize(): void{
    this.isMobile = (window.screen.width < 576 || window.innerWidth < 576) ? true : false;
  }
  //? Engineer Performance
  chartOptions: any = {};
  performanceRating: number = 1;
  chartHeight: string = '200';

  constructor(private ChartService: ChartService) {}

  ngOnInit(): void {
    this.isMobile = (window.screen.width < 576 || window.innerWidth < 576) ? true : false;
    //? Calculate engineer's KPI
    const KPI = parseFloat((this.engineerRemarkAndKPI.onTimeTaskKPI + this.engineerRemarkAndKPI.onTimeTicketKPI + this.engineerRemarkAndKPI.fixedTicketKPI + this.engineerRemarkAndKPI.workloadKPI + this.engineerRemarkAndKPI.numOfEarlyTaskCompletion + this.engineerRemarkAndKPI.numOfEarlyTicketResolution - this.engineerRemarkAndKPI.numOfLateTask - this.engineerRemarkAndKPI.numOfLateTicket).toFixed(2));
    const kpiCalculation = KPI > 100 ? 100 : KPI < 0 ? 0 : KPI;
    this.performanceRating = kpiCalculation >= 76 ? 4 : kpiCalculation >= 51 ? 3 : kpiCalculation >= 26 ? 2 : 1;
    this.chartOptions = this.getChartOptions(this.chartHeight, '#FBB709F1', kpiCalculation)
    //? Draw the weekly workload bar chart of the engineer
    this.bar_chart = this.ChartService.createBarChart("workload-bar-chart", Object.keys(this.engineerRemarkAndKPI.workloadObj), Object.values(this.engineerRemarkAndKPI.workloadObj));
  }

  getChartOptions(chartHeight: string, chartColor: string, progress: number) {
    const lightColor = getCSSVariableValue('--bs-' + chartColor + '-light');
    const labelColor = getCSSVariableValue('--bs-gray-700');
  
    return {
      series: [progress],
      chart: {
        fontFamily: 'inherit',
        height: chartHeight,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: '65%',
          },
          dataLabels: {
            name: {
              show: false,
              fontWeight: '700',
            },
            value: {
              color: labelColor,
              fontSize: '30px',
              fontWeight: '700',
              offsetY: 12,
              show: true,
              formatter: function (val: number) {
                return val + '%';
              },
            },
          },
          track: {
            background: lightColor,
            strokeWidth: '100%',
          },
        },
      },
      colors: [chartColor],
      stroke: {
        lineCap: 'round',
      },
      labels: ['Progress'],
    };
  }
}
