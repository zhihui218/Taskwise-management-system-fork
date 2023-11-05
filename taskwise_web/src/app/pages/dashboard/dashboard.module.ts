import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { WidgetsModule } from '../../_metronic/partials';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'src/app/utils/shared/shared.module';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { FirstCardComponent } from '../../utils/first-card/first-card.component';
import { SecondCardComponent } from '../../utils/second-card/second-card.component';
import { MonthlyReportComponent } from '../../utils/monthly-report/monthly-report.component';


@NgModule({
  declarations: 
  [
    DashboardComponent, 
    FirstCardComponent, 
    SecondCardComponent, 
    MonthlyReportComponent
  ],
  imports: [
    CommonModule,
    DropdownModule,
    SharedModule,
    FormsModule,
    CheckboxModule,
    SkeletonModule,
    PaginatorModule,
    ChipModule,
    ProgressBarModule,
    AvatarModule,

    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    WidgetsModule,
    TableModule
  ],
})
export class DashboardModule {}
