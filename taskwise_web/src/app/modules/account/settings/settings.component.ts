import { Component } from '@angular/core';
import { AuthService } from '../../auth';
import { ROLE } from 'src/app/utils/const';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

  ROLE = ROLE;
  constructor(public authService: AuthService) {}
}
