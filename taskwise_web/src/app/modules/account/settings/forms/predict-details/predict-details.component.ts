import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, UserType } from 'src/app/modules/auth';
import { Subscription, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ATTRITION, EDUCATION_BACKGROUND, EMP_EDUCATION_LEVEL, EMP_ENVIRONMENT_SATISFACTION, EMP_JOB_SATISFACTION, EMP_RELATIONSHIP_SATISFACTION, EMP_WORKLIFE_BALANCE, GENDER, MARITAL_STATUS, OVERTIME } from 'src/app/utils/const';
import { DateFormatter } from 'src/app/utils/DateConverter';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-predict-details',
  templateUrl: './predict-details.component.html',
  styleUrls: ['./predict-details.component.scss'],
})

export class PredictDetailsComponent implements OnInit, OnDestroy {
  DateFormatter = new DateFormatter();
  private unsubscribe: Subscription[] = [];
  isLoading$: Observable<boolean>;
  isLoading: boolean;
  user$: Observable<UserType>;
  //? The information necessary for "MANAGER" to do performance prediction
  predictForm: FormGroup;
  //? Fields to be filled in
  genders: String[] = Object.keys(GENDER);
  educationBackground: String[] = Object.keys(EDUCATION_BACKGROUND)
  maritalStatus: String[] = Object.keys(MARITAL_STATUS)
  educationLevel: String[] = Object.keys(EMP_EDUCATION_LEVEL)
  environmentSatisfaction: String[] = Object.keys(EMP_ENVIRONMENT_SATISFACTION)
  jobSatisfaction: String[] = Object.keys(EMP_JOB_SATISFACTION)
  isOvertime: String[] = Object.keys(OVERTIME)
  relationshipSatisfaction: String[] = Object.keys(EMP_RELATIONSHIP_SATISFACTION)
  worklifeBalance: String[] = Object.keys(EMP_WORKLIFE_BALANCE)
  isAttrition: String[] = Object.keys(ATTRITION)


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private ToastService: ToastAlertService
  ) {
    this.isLoading = false;
    this.isLoading$ = this.authService.isLoading$; 
  }

  ngOnInit(): void {
    this.initForm();
    this.user$ = this.authService.currentUserSubject.asObservable();
    let subscription = this.user$.subscribe((user: UserType) => {
      this.predictForm.patchValue(user!)
    });
    this.unsubscribe.push(subscription);
  }

  initForm(){
    this.predictForm = this.fb.group({
      Age: [
        '',
        Validators.compose([Validators.required])
      ],
      Gender: [
        this.genders[0],
        Validators.compose([Validators.required])
      ],
      EducationBackground:[
        this.educationBackground[0],
        Validators.compose([Validators.required])
      ],
      MaritalStatus: [
        this.maritalStatus[0],
        Validators.compose([Validators.required])
      ],
      DistanceFromHome: [
        '',
        Validators.compose([Validators.required])
      ],
      EmpEducationLevel: [
        this.educationLevel[0],
        Validators.compose([Validators.required])
      ],
      EmpEnvironmentSatisfaction: [
        this.environmentSatisfaction[0],
        Validators.compose([Validators.required])
      ],
      EmpJobSatisfaction: [
        this.jobSatisfaction[0],
        Validators.compose([Validators.required])
      ],
      NumCompaniesWorked: [
        '',
        Validators.compose([Validators.required])
      ],
      OverTime: [
        this.isOvertime[0],
        Validators.compose([Validators.required])
      ],
      EmpRelationshipSatisfaction: [
        this.relationshipSatisfaction[0],
        Validators.compose([Validators.required])
      ],
      TotalWorkExperienceInYears: [
        '',
        Validators.compose([Validators.required])
      ],
      EmpWorkLifeBalance: [
        this.worklifeBalance[0],
        Validators.compose([Validators.required])
      ],
      ExperienceYearsInCurrentRole: [
        '',
        Validators.compose([Validators.required])
      ],
      Attrition: [
        this.isAttrition[0],
        Validators.compose([Validators.required])
      ],
    }
    )
  }

  saveSettings(user_id: string){
    this.isLoading = true;
    let subscription = this.authService.updateEngineerDetails(this.predictForm.value, user_id).subscribe(result => {
      this.isLoading = false;
      this.ToastService.invokeToastAlert
      (
        result ? 'success' : 'error',
        result ? 'Success' : 'Error',
        result ? 'You\'ve updated your information successfully!' : 'Something wrong happens, please try again later'
      )
    });
    this.unsubscribe.push(subscription);
  }

  ngOnDestroy() { this.unsubscribe.forEach((sb) => sb.unsubscribe()); }
}
