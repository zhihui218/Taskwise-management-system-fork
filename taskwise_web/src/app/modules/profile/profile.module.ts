import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from 'src/app/utils/shared/shared.module';
import { OverviewComponent } from './overview/overview.component';
import { ProjectsComponent } from './projects/projects.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { CreateProjectFormComponent } from 'src/app/form-modal/project/create-project-form.component';
import { CreateTaskFormComponent } from 'src/app/form-modal/task/create-task-form.component';
import { CreateTicketFormComponent } from 'src/app/form-modal/ticket/create-ticket-form.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { FileUploadComponent } from 'src/app/utils/file-upload/file-upload.component';
import { ConnectionsComponent } from './connections/connections.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MissionOverviewComponent } from './mission-overview/mission-overview.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ListViewComponent } from '../../utils/list-view/list-view.component';

import {
  CardsModule,
  DropdownMenusModule,
  WidgetsModule,
  DrawersModule
} from '../../_metronic/partials';

// Primeng
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ChipModule } from 'primeng/chip';
import { TabMenuModule } from 'primeng/tabmenu';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@NgModule({
  declarations: [
    ProfileComponent,
    OverviewComponent,
    ProjectsComponent,
    CampaignsComponent,
    DocumentsComponent,
    ConnectionsComponent,
    CreateProjectFormComponent,
    CreateTaskFormComponent,
    CreateTicketFormComponent,
    ProjectDetailComponent,
    TaskDetailComponent,
    MissionOverviewComponent,
    ListViewComponent,
    FileUploadComponent,
    TicketsComponent,
    TicketDetailComponent,
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    InlineSVGModule,
    SharedModule,
    DropdownMenusModule,
    DrawersModule,
    WidgetsModule,
    CardsModule,
    ReactiveFormsModule,
    FormsModule,
    DynamicDialogModule,
    MultiSelectModule,
    ConfirmDialogModule,
    DropdownModule,
    ChipModule,
    PaginatorModule,
    TabMenuModule,
    AvatarModule,
    TooltipModule,
    AvatarGroupModule,
    OverlayPanelModule,
    AccordionModule
  ],
  providers:[DynamicDialogConfig]
})
export class ProfileModule {}
