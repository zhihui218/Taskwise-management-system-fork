import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UserPasswordPostDTO, UserType } from 'src/app/modules/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatchPassword } from 'src/app/utils/validator';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';


@Component({
  selector: 'app-sign-in-method',
  templateUrl: './sign-in-method.component.html',
  styleUrls: ['./sign-in-method.component.scss'],
})
export class SignInMethodComponent implements OnInit, OnDestroy {
  showChangeEmailForm: boolean = false;
  showChangePasswordForm: boolean = false;
  isLoading$: Observable<boolean>;
  private unsubscribe: Subscription[] = [];
  // Toggle the "New Password" && "Confirm New Password" fields
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  user$: Observable<UserType>;
  passwordForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private ToastService: ToastAlertService,
  ) 
  {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
    this.user$ = this.authService.currentUserSubject.asObservable();
  }

  initForm(){
    this.passwordForm = this.fb.group({
      password: [
        '',
        Validators.compose([Validators.required])
      ],
      confirmPassword: [
        '',
        Validators.compose([Validators.required])
      ]
    }, { validator: MatchPassword()})
  }

  toggleEmailForm(show: boolean) {
    this.showChangeEmailForm = show;
  }

  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(){
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  togglePasswordForm(show: boolean) {
    this.showChangePasswordForm = show;
  }

  savePassword(_id: string) {
    let user: UserPasswordPostDTO = {
      password: this.passwordForm.get('password')?.value
    }
    let subscription = this.authService.updateUser(user, _id).subscribe(result => {
      if(result) this.passwordForm.reset();
      this.ToastService.invokeToastAlert
      (
        result ? 'success' : 'error',
        result ? 'Success' : 'Error',
        result ? 'You\'ve updated your password successfully!' : 'Something wrong happens, please try again later'
      )
    });
    this.unsubscribe.push(subscription);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
