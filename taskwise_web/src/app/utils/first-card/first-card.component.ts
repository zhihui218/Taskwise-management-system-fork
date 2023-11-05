import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TYPE, STATUS, TICKET_STATUS } from '../const';
import { Observable } from 'rxjs';
import { DashboardService } from 'src/app/Services/dashboard.service';

@Component({
  selector: 'app-first-card',
  templateUrl: './first-card.component.html',
  styleUrls: ['./first-card.component.scss']
})
export class FirstCardComponent implements OnInit {

  @Input() model_type: string;
  @Input() model: any;
  TYPE = TYPE;
  STATUS = STATUS;
  TICKET_STATUS = TICKET_STATUS;

  constructor
  (
  )
  {
  }

  ngOnInit(): void {
    
  }
}
