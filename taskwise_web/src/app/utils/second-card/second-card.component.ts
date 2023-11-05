import { Component, Input } from '@angular/core';
import { ROLE } from '../const';

@Component({
  selector: 'app-second-card',
  templateUrl: './second-card.component.html',
  styleUrls: ['./second-card.component.scss']
})
export class SecondCardComponent {

  @Input() user_type: string;
  @Input() count: number;
  ROLE = ROLE;
}
