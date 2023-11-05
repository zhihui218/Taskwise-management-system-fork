import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, UserType, UserInfoPostDTO } from 'src/app/modules/auth';
import { Subscription, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utils } from 'src/app/utils/FileConverter';
import { ToastAlertService } from 'src/app/Services/toast-alert.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss'],
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {

  private unsubscribe: Subscription[] = [];
  isLoading$: Observable<boolean>;
  user$: Observable<UserType>;
  profileForm: FormGroup;
  imageUrl: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private ToastService: ToastAlertService
  ) 
  {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
    this.user$ = this.authService.currentUserSubject.asObservable();
    let subscription = this.user$.subscribe((user: UserType) => {
      this.profileForm.patchValue(user!)
    });
    this.unsubscribe.push(subscription);
  }

  initForm(){
    this.profileForm = this.fb.group({
      name: [
        '',
        Validators.compose([Validators.required])
      ],
      phone: [
        '',
        Validators.compose([Validators.required])
      ],
      profile:[
        ''
      ]
    }
    )
  }

  saveSettings(user_id: string){
    let user: UserInfoPostDTO = {
      name: this.profileForm.get('name')?.value,
      phone: this.profileForm.get('phone')?.value,
      profile: this.profileForm.get('profile')?.value,
    }
    let subscription = this.authService.updateUser(user, user_id).subscribe(result => {
      this.ToastService.invokeToastAlert
      (
        result ? 'success' : 'error',
        result ? 'Success' : 'Error',
        result ? 'You\'ve updated your profile successfully!' : 'Something wrong happens, please try again later'
      )
    });
    this.unsubscribe.push(subscription);
  }

  async onFileSelected(imageInput: any){
    if(imageInput.target.files.length > 0){
      // Read the image url to be stored & displayed
      const file: File = imageInput.target.files[0];
      Utils.toBase64(file).then((value: any) => {
        this.imageUrl = value;
        this.profileForm.patchValue({
          profile: file
        });
        //* To change the image preview when new image is selected
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
