import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../auth';
import { MessageService } from 'primeng/api';
import { ROLE } from 'src/app/utils/const';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';
import { noWhitespaceValidator } from 'src/app/utils/validator';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})

export class AddUserComponent implements OnInit, OnDestroy {

  ROLE = ROLE;
  addUserForm: FormGroup;
  // To check whether the APIs process is done
  isLoading$: Observable<boolean>;
  // Check whether the API call has error
  hasError: boolean;
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  showPassword: boolean = false;

  constructor
  (
    //private employeeService: EmployeeService,
    private fb: FormBuilder,
    private authService: AuthService,
    private ToastService: ToastAlertService
  )
  {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.addUserForm = this.fb.group({
      role: [
        'MANAGER',
        Validators.compose([Validators.required])
      ],
      name: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(100), //https://stackoverflow.com/questions/30485/what-is-a-reasonable-length-limit-on-person-name-fields
          noWhitespaceValidator,
        ])
      ],
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      joining_date: [''],
      company_name: [
        '',
        Validators.compose([
          noWhitespaceValidator,
        ])
      ]
    });

    this.onRoleChange();
  }

  get userRole(){
    return this.addUserForm.get('role').value;
  }

  setRoleValue(role: string): void{
    this.addUserForm.get('role')?.setValue(role);
    this.resetForm();
    this.onRoleChange();
  }

  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }

  createUser(){
    let subscription =  this.authService.registration(this.addUserForm.value).subscribe((result: any) => {
      if(result){
        this.resetForm();
      }
      this.ToastService.invokeToastAlert
      (
        result ? 'success' : 'error',
        result ? 'Success' : 'Error',
        result ? 'You\'ve added a new user successfully!' : 'User exists, please try again!'
      );
    })
    this.unsubscribe.push(subscription);
  }

  // Shouldn't reset the role
  resetForm(): void{
    this.addUserForm.patchValue({
      name: '',
      email: '',
      password: '',
      joining_date: '',
      company_name: ''
    })
  }

  // Unsubscribe each Observable when the component is destroyed to avoid memory leak
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe);
  }

  private onRoleChange(): void {
    const joiningDateControl = this.addUserForm.get('joining_date');
    // const companyNameControl = this.addUserForm.get('company_name');
    //? `joining_date` is required for the "ENGINEER"
    if (this.userRole != ROLE.CLIENT) joiningDateControl.setValidators([Validators.required]);
    else joiningDateControl.setValidators(null);
    //? `company_name` is required for the "CLIENT"
    // if(this.userRole == ROLE.CLIENT) companyNameControl.setValidators([Validators.required]);
    // else companyNameControl.setValidators(null);

    joiningDateControl.updateValueAndValidity();
    // companyNameControl.updateValueAndValidity();
}
}

