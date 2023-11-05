import { Component, Input, OnInit } from '@angular/core';
import { TicketGetDTO } from 'src/app/DTOs/TicketDTO';
import { TICKET_STATUS, PRIORITY } from 'src/app/utils/const';

@Component({
  selector: 'app-ticket-card',
  templateUrl: './ticket-card.component.html',
  styleUrls: ['./ticket-card.component.scss']
})
export class TicketCardComponent implements OnInit {

  @Input() ticket: TicketGetDTO;
  @Input() isClient: boolean;
  TICKET_STATUS = TICKET_STATUS;
  PRIORITY = PRIORITY;
  //* To check whether the "Project" is overdue
  currentDate: Date = new Date();
  isToday: boolean = false;
  isOverdue: boolean = false;

  constructor(){}

  ngOnInit(): void {
    this.currentDate.setHours(0,0,0,0);
    this.checkDate();
  }

  checkDate(){
    if(this.ticket.due_date){
      const date = new Date(this.ticket.due_date);
      date.setHours(0, 0, 0, 0);
  
      if(date < this.currentDate && this.ticket.status != "Completed") this.isOverdue = true;
  
      if(date.getTime() == this.currentDate.getTime() && this.ticket.status != "Completed") this.isToday = true;
    }
  }
}
