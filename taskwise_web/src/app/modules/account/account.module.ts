import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';

import { AccountRoutingModule } from './account-routing.module';
import { AccountComponent } from '../account/account.component';
import { OverviewComponent } from './overview/overview.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileDetailsComponent } from './settings/forms/profile-details/profile-details.component';
import { ConnectedAccountsComponent } from './settings/forms/connected-accounts/connected-accounts.component';
import { DeactivateAccountComponent } from './settings/forms/deactivate-account/deactivate-account.component';
import { EmailPreferencesComponent } from './settings/forms/email-preferences/email-preferences.component';
import { NotificationsComponent } from './settings/forms/notifications/notifications.component';
import { SignInMethodComponent } from './settings/forms/sign-in-method/sign-in-method.component';
import { DropdownMenusModule, WidgetsModule } from '../../_metronic/partials';
import { AddUserComponent } from './add-user/add-user.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TableModule } from 'primeng/table';
import { UsersComponent } from './users/users.component';
import { ClientTableComponent } from '../../utils/client-table/client-table.component';
import { UserTableComponent } from '../../utils/user-table/user-table.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PredictPerformanceComponent } from 'src/app/form-modal/predict-performance/predict-performance.component';

import {
  CardsModule,
} from '../../_metronic/partials';

import { SharedModule } from 'src/app/utils/shared/shared.module';
import { PredictDetailsComponent } from './settings/forms/predict-details/predict-details.component';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';
import { SelectButtonModule } from 'primeng/selectbutton';


@NgModule({
  declarations: [
    AccountComponent,
    OverviewComponent,
    SettingsComponent,
    ProfileDetailsComponent,
    ConnectedAccountsComponent,
    DeactivateAccountComponent,
    EmailPreferencesComponent,
    NotificationsComponent,
    SignInMethodComponent,
    AddUserComponent,
    UsersComponent,
    UserTableComponent,
    ClientTableComponent,
    UserDetailComponent,
    PredictDetailsComponent,
    PredictPerformanceComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    InlineSVGModule,
    DropdownMenusModule,
    WidgetsModule,
    SelectButtonModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    SkeletonModule,
    PaginatorModule,
    AvatarGroupModule,
    AvatarModule,
    RatingModule,
    TableModule,
    ChipModule,
    CardsModule,
    SharedModule
  ],
})
export class AccountModule {}
