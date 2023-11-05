import { Component, Input, OnInit } from '@angular/core';
import { IconUserModel } from '../icon-user.model';
// import { ProgressGetDTO } from 'src/app/DTOs/ProgressGetDTO';

@Component({
  selector: 'app-card2',
  templateUrl: './card2.component.html',
})
export class Card2Component implements OnInit {
  //* To check whether display "Project" / "Task" list
  @Input() list_type;
  @Input() icon: string = '';
  @Input() badgeColor: string = '';
  @Input() status: string = '';
  @Input() statusColor: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() date: string = '';
  @Input() budget: string = '';
  // @Input() task_progress: ProgressGetDTO;
  // @Input() ticket_progress: ProgressGetDTO;
  @Input() numOfTask: number;
  @Input() numOfTicket: number;
  @Input() numOfEngineer: number;
  @Input() users: Array<IconUserModel> = [];
  //* To check whether the "Project" is overdue
  currentDate: Date = new Date();
  isToday: boolean = false;
  isOverdue: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.currentDate.setHours(0,0,0,0);
    this.checkDate();
  }

  checkDate(){
    const due_date = new Date(this.date);
    due_date.setHours(0, 0, 0, 0);

    if(due_date < this.currentDate && this.status != "Completed") this.isOverdue = true;

    if(due_date.getTime() == this.currentDate.getTime() && this.status != "Completed") this.isToday = true;
  }
}
