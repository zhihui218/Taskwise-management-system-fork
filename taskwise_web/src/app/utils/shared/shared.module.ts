import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskTableComponent } from '../task-table/task-table.component';
import { TicketTableComponent } from '../ticket-table/ticket-table.component';
import { ProjectTableComponent } from '../project-table/project-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [TaskTableComponent, TicketTableComponent, ProjectTableComponent],
  exports: [TaskTableComponent, TicketTableComponent, ProjectTableComponent],
  imports: 
  [
    CommonModule,
    SkeletonModule, 
    PaginatorModule, 
    ChipModule,
    AvatarModule,
    AvatarGroupModule,
    TableModule,
    ProgressBarModule
  ]
})
export class SharedModule { }
