import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  showPassword: boolean = false;
  resetToken: string;
  email: string;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
    //* 1. Get the valid token from the route
    this.resetToken = this.route.snapshot.paramMap.get('token');
    //* 2. Check whether it's unauthorized access
    if(!this.resetToken) this.router.navigateByUrl('/')
    else this.email = (JSON.parse(atob(this.resetToken.split('.')[1]))).email;
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetPasswordForm.controls; }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      password: [
        //this.defaultAuth.password,
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    this.errorState = ErrorStates.NotSubmitted;
    const resetPasswordSubscr = this.authService
      .resetPassword(this.resetToken, this.f.password.value)
      .pipe(first())
      .subscribe((result: boolean) => {
        this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
      });
    this.unsubscribe.push(resetPasswordSubscr);
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
}
