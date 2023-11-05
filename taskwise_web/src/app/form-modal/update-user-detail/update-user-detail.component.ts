import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService, UserPostDTO } from 'src/app/modules/auth';
import { Utils } from 'src/app/utils/FileConverter';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MatchPassword } from 'src/app/utils/validator';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-update-user-detail',
  templateUrl: './update-user-detail.component.html',
  styleUrls: ['./update-user-detail.component.scss'],
  //! Don't put this so that we can access data passed from the parent dialog
  // providers:[DynamicDialogConfig]
})

export class UpdateUserDetailComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];
  detailsForm: FormGroup;
  isLoading$: Observable<boolean>;
  imageUrl: string;
  _id: string;
  name: string;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  constructor
  (
    private fb: FormBuilder, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dynamicConfig: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private ToastService: ToastAlertService
  ){
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this._id = this.dynamicConfig.data._id;
    this.name = this.dynamicConfig.data.name;
    this.initForm();
  }

  initForm(): void{
    this.detailsForm = this.fb.group({
      name: [
        this.name,
        Validators.compose([Validators.required])
      ],
      phone: [
        '',
        Validators.compose([Validators.required])
      ],
      profile:[
        '',
        Validators.compose([Validators.required])
      ],
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

  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword(){
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  saveSettings(user_id: string){
    let user: UserPostDTO = {
      name: this.detailsForm.get('name')?.value,
      phone: this.detailsForm.get('phone')?.value,
      profile: this.detailsForm.get('profile')?.value,
      password: this.detailsForm.get('password')?.value
    }
    let subscription = this.authService.updateUser(user, user_id).subscribe(result => {
      this.ToastService.invokeToastAlert
      (
        result ? 'success' : 'error',
        result ? 'Success' : 'Error',
        result ? 'You\'ve updated your profile successfully!' : 'Unexpected error occurs, please try again later!'
      );
      if(result) this.ref.close();
    });
    this.unsubscribe.push(subscription);
  }

  async onFileSelected(imageInput: any){
    if(imageInput.target.files.length > 0){
      // Read the image url to be stored & displayed
      const file: File = imageInput.target.files[0];
      Utils.toBase64(file).then((value: any) => {
        this.imageUrl = value;
        //* Fetch the "file" value to "profile" formControl
        this.detailsForm.patchValue({profile: file});
        //* To change the image preview when new image is selected
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
