import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { AccountComponent } from './account.component';
import { SettingsComponent } from './settings/settings.component';
import { AddUserComponent } from './add-user/add-user.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { AccessGuard } from '../auth/services/access.guard';
import { ROLE } from 'src/app/utils/const';

const routes: Routes = [
  {
    path: '',
    component: AccountComponent,
    children: [
      {
        path: 'overview',
        component: OverviewComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'add-user',
        component: AddUserComponent,
        canActivate: [AccessGuard],
        data: { accessRole: ROLE.MANAGER }
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AccessGuard],
        data: { accessRole: ROLE.MANAGER }
      },
      {
        path: 'users/:role/:user_id',
        component: UserDetailComponent,
        canActivate: [AccessGuard],
        data: { accessRole: ROLE.MANAGER }
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
