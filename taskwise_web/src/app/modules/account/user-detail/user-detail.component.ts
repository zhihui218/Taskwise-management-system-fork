import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from 'src/app/Services/user.service';
import { EngineerRemarkAndKPI, UserGetDTO } from '../../auth';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit{

  DateFormatter = new DateFormatter();
  //? Toggle the Employee Performance Prediction Form
  isPredictOpen: boolean = false;
  ROLE = ROLE;
  user: UserGetDTO;
  engineerRemarks: EngineerRemarkAndKPI;

  constructor
  (
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ){ }

  async ngOnInit(): Promise<void> {
    //? Either a "CLIENT" || "ENGINEER"
    const role = this.route.snapshot.paramMap.get('role');
    const user_id = this.route.snapshot.paramMap.get('user_id');
    //? Get the user details
    const result_1 = await this.userService.getUserById(user_id);
    if(result_1) this.user = result_1;
    if(role == ROLE.ENGINEER){
      //? Get the "ENGINEER" remarks && kpi
    const result_2 = await this.userService.getEngineerRemarkAndKPI(user_id);
    if(result_2) this.engineerRemarks = result_2;
    }

    this.cdr.detectChanges();
  }

  goBack(): void {
    this.location.back();
  }

  updateUser(user: UserGetDTO): void{
    this.user = user;
  }

  togglePredictionForm(): void{
    this.isPredictOpen = !this.isPredictOpen;
  }
}
