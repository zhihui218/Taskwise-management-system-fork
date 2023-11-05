import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  ROLE = ROLE;

  constructor(public authService: AuthService){

  }

  ngOnInit(): void {
    
  }

}
