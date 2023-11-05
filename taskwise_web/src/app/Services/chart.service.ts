import { Injectable } from '@angular/core';
import { STATUS, TICKET_STATUS } from '../utils/const';
// import 'chartjs-plugin-zoom';
import Chart from 'chart.js/auto';
//? To display the datalabels on the graph
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  border_complete: string = '#1A5D1A';
  border_pending: string = '#FFB100';
  border_onHold: string = '#1D5D9B';

  //* Project, Task, Ticket
  bg_project: string = '#04C8C8';
  bg_task: string = '#FFC700';
  bg_ticket: string = '#009EF7';

  constructor() { }

  //* For each project
  createPieChart(htmlId: string, data: number[], labels: string[], backgroundColor: string[], title: string): any{
    return new Chart(htmlId, {
      //* 1. this denotes tha type of chart
      type: 'pie',

      //* 2. Denote the values on X-Axis
      data: 
      {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor,
            hoverOffset: 4
          }
      ],
      },
      options: { 
        maintainAspectRatio: false, // This disables the aspect ratio constraint
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          // Customize tooltip
          tooltip: {
            callbacks: {
              label: function(context){
                //* 1. Retrieve the value of each subsection
                let label = context.raw;
                //* 2. Append the data with a `%` symbol
                return label + '%';
              }
            }
          },
          datalabels: { display: false }
        }
      },
      });
  }

  //* For each project
  createDashboardPieChart(htmlId: string, data: any, type: string, pdfReport?: boolean): any{

    let dataLabelsOption = {};

    if(pdfReport){
      dataLabelsOption = {
        align: 'center', // Center alignment
        anchor: 'center', // Anchor in the center
        formatter: function(value, context) {
          if(value == 0) return '';
          else return value;
        },
        color: 'white',
        font: {
          size: 25,
          weight: 'bold'
        }
    }
  }
  
  return new Chart(htmlId, {
      //* 1. this denotes tha type of chart
      type: 'pie',

      //* 2. Denote the values on X-Axis\
      data: 
      {
        labels: type == "PROJECT" ? [STATUS.PENDING, STATUS.ONHOLD, STATUS.COMPLETED] : [TICKET_STATUS.PENDING, TICKET_STATUS.REOPENED, TICKET_STATUS.SOLVED],
        datasets: [
          {
            data: type == "PROJECT" ? [ data[STATUS.PENDING], data[STATUS.ONHOLD], data[STATUS.COMPLETED] ] : [ data[TICKET_STATUS.PENDING], data[TICKET_STATUS.REOPENED], data[TICKET_STATUS.SOLVED] ],
            backgroundColor: ['#FFC700', '#009EF7', '#04C8C8'],
            hoverOffset: 4
          }
      ],
      },
      options: { 
        maintainAspectRatio: false, // This disables the aspect ratio constraint
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Total ${ type == "PROJECT" ? 'Project' : 'Ticket' }: ${ data['Total'] }`,
          },
          datalabels: pdfReport ? dataLabelsOption : { display: false }
        }
      },
    });
  }

  //? For the workload of each day in the current week for the engineer
  createBarChart(htmlId: string, x_axis_label: string[], data: any): any{
    return new Chart(htmlId, {
      type: 'bar',
      
      //* Denote the values on X-Axis
      data: {
        labels: x_axis_label,
        datasets: [{
          label: 'Workload Per Day',
          data: data,
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          borderColor: 'rgb(255, 205, 86)',
          borderWidth: 1,
          barThickness: 20,
          borderRadius: 10 
        }],
      }, 
      options: { 
        maintainAspectRatio: false, // This disables the aspect ratio constraint
        responsive: true,
        scales:{
          y: {
            //? Make extra space at y-axis
            grace: 2,
            beginAtZero: true,
            // ticks: {
            //   stepSize: 5
            // }
          }
        },
        plugins: {
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: function(context){
                //* 1. Retrieve the value of each subsection
                let label = context.raw;
                //* 2. Append the data with a `%` symbol
                return label + ' hour(s)';
              }
            }
          },
        },
      },
    })
  }

  //* For "Task Distribution" in "Dashboard"
  createLineChart(htmlId: string, x_axis_label: string[], dataset: any, pdfReport?: boolean): any{
    
    let dataLabelsOption = {};

    if(pdfReport){
      dataLabelsOption = {
        align: 'top', // Center alignment
        anchor: 'top', // Anchor in the center
        formatter: function(value, context) {
          if(value == 0) return '';
          else return value;
        },
        color: 'black',
        font: {
          size: 17.5,
          weight: 'bold'
        }
    }
  }
  
  return new Chart(htmlId, {
      type:'line',

      //* 2. Denote the values on X-Axis\
      data: {
        labels: x_axis_label,
        datasets: this.datasetFormatter(dataset),
      },
      options: { 
        maintainAspectRatio: false, // This disables the aspect ratio constraint
        responsive: true,
        scales:{
          y: {
            //? Make extra space at y-axis
            grace: 2,
            beginAtZero: true,
            // ticks: {
            //   stepSize: 5
            // }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Total Task: ${ dataset['Total'] }`,
          },
          datalabels: pdfReport ? dataLabelsOption : { display: false }
        },
      },
    });
  }

  private datasetFormatter(data: any): any{
    // const context = (document.getElementById(htmlId) as HTMLCanvasElement)?.getContext("2d");
    //* Define the datasets to be displayed dynamically
    const dynamicData = [];

    if(data[STATUS.PENDING] || data['Project']){
      dynamicData.push
      (
        {
          label: data[STATUS.PENDING] ? STATUS.PENDING : 'Project',
          data: data[STATUS.PENDING] || data['Project'],
          fill: true,
          backgroundColor: data[STATUS.PENDING] ? "rgba(248, 222, 34, 0.3)" : this.bg_project,
          borderColor: this.border_pending,
          pointBackgroundColor: data[STATUS.PENDING] ? this.border_pending : null,
          borderWidth: data[STATUS.PENDING] ? 0.5 : null,
          pointRadius: data[STATUS.PENDING] ? 2.5 : null,
        }
      )
    }

    if(data[STATUS.ONHOLD] || data['Task']){
      dynamicData.push
      (
        {
          label: data[STATUS.ONHOLD] ?  STATUS.ONHOLD : 'Task',
          data: data[STATUS.ONHOLD] || data['Task'],
          fill: true,
          backgroundColor: data[STATUS.ONHOLD] ?  'rgba(51, 102, 204, 0.7)' : this.bg_task,
          borderColor: this.border_onHold,
          pointBackgroundColor: data[STATUS.ONHOLD] ? this.border_onHold : null,
          borderWidth: data[STATUS.ONHOLD] ? 0.5 : null,
          pointRadius: data[STATUS.ONHOLD] ? 2.5 : null,
        }
      )
    }

    if(data[STATUS.COMPLETED] || data['Ticket']){
      dynamicData.push
      (
        {
          label: data[STATUS.COMPLETED] ? STATUS.COMPLETED : 'Ticket',
          data: data[STATUS.COMPLETED] || data['Ticket'],
          fill: true,
          backgroundColor: data[STATUS.COMPLETED] ? "rgba(16, 150, 24, 0.2)" : this.bg_ticket,
          borderColor: this.border_complete,
          pointBackgroundColor: data[STATUS.COMPLETED] ? this.border_complete : null,
          borderWidth: data[STATUS.COMPLETED] ? 0.5 : null,
          pointRadius: data[STATUS.COMPLETED] ? 2.5 : null,
        }
      )
    }

    return dynamicData;
  }

  private createLinearGradient(context, color, opacity) {
    const gradient = context.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `rgba(${color}, ${opacity})`);
    gradient.addColorStop(1, `rgba(0, 210, 255, 0.3)`);
    return gradient;
  }
}
