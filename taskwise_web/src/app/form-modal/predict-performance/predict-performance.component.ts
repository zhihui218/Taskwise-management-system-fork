import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';
import { UserService } from 'src/app/Services/user.service';
import { UserGetDTO } from 'src/app/modules/auth';
import { BUSINESS_TRAVEL_FREQUENCY, COUNTRY_CURRENCY, EMP_DEPARTMENT, EMP_JOB_INVOLVEMENT, EMP_JOB_LEVEL, EMP_JOB_ROLE, PERFORMANCE_RATING } from 'src/app/utils/const';

@Component({
  selector: 'app-predict-performance',
  templateUrl: './predict-performance.component.html',
  styleUrls: ['./predict-performance.component.scss'],
})
export class PredictPerformanceComponent implements OnInit {

  isLoading: boolean;
  COUNTRY_CURRENCY = COUNTRY_CURRENCY;
  PERFORMANCE_RATING = PERFORMANCE_RATING;
  //? Current engineer that the manager viewing
  @Input() current_engineer: UserGetDTO;
  @Output() closePredictForm: EventEmitter<void> = new EventEmitter<void>();
  @Output() updatedUser: EventEmitter<UserGetDTO> = new EventEmitter<UserGetDTO>();
  department: String[] = Object.keys(EMP_DEPARTMENT);
  jobRole: String[] = Object.keys(EMP_JOB_ROLE)
  businessTravelFrequency: String[] = Object.keys(BUSINESS_TRAVEL_FREQUENCY);
  jobInvolvement: String[] = Object.keys(EMP_JOB_INVOLVEMENT);
  jobLevel: String[] = Object.keys(EMP_JOB_LEVEL);
  predictForm: FormGroup;
  isMadePrediction: boolean = false;
  rating: number;

  constructor(private fb: FormBuilder, private ToastService: ToastAlertService, private userService: UserService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.initForm();
    this.predictForm.patchValue(this.current_engineer);
    if(this.current_engineer?.PerformanceRating) this.rating = this.current_engineer.PerformanceRating;
  }

  initForm(){
    this.predictForm = this.fb.group({
      EmpDepartment: [
        this.department[0],
        Validators.compose([Validators.required])
      ],
      EmpJobRole: [
        this.jobRole[0],
        Validators.compose([Validators.required])
      ],
      BusinessTravelFrequency:[
        this.businessTravelFrequency[0],
        Validators.compose([Validators.required])
      ],
      EmpHourlyRate: [
        '',
        Validators.compose([Validators.required])
      ],
      EmpJobInvolvement: [
        this.jobInvolvement[0],
        Validators.compose([Validators.required])
      ],
      EmpJobLevel: [
        this.jobLevel[0],
        Validators.compose([Validators.required])
      ],
      EmpLastSalaryHikePercent: [
        '',
        Validators.compose([Validators.required])
      ],
      TrainingTimesLastYear: [
        '',
        Validators.compose([Validators.required])
      ],
      YearsSinceLastPromotion: [
        '',
        Validators.compose([Validators.required])
      ],
      YearsWithCurrManager: [
        '',
        Validators.compose([Validators.required])
      ],
    }
    )
  }

  async makePrediction(): Promise<void>{
    this.isLoading = true;
    //* 1. Save the relevant details of user 
    const user: UserGetDTO | undefined = await this.userService.updateEngineerByManager(this.current_engineer._id, this.predictForm.value);
    if(user){ 
      this.current_engineer = user; 
      this.updatedUser.emit(user); 
      this.isMadePrediction = true;
      this.rating = this.current_engineer.PerformanceRating;
    }
    else{ 
      this.ToastService.invokeToastAlert('error', 'Error', 'Please make sure other required fields are filled by your engineer.');
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
