import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProfileComponent } from './profile.component';
import { ConnectionsComponent } from './connections/connections.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component'
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { MissionOverviewComponent } from './mission-overview/mission-overview.component';
import { TicketsComponent } from './tickets/tickets.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { AccessGuard } from '../auth/services/access.guard';
import { ROLE } from 'src/app/utils/const';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      // {
      //   path: 'overview',
      //   component: OverviewComponent,
      // },
      // Project Route
      {
        path: 'projects',
        component: ProjectsComponent,
        canActivate: [AccessGuard],
        data: { accessRole: [ROLE.MANAGER, ROLE.CLIENT] }
      },
      {
        path: 'projects/:projectId',
        component: ProjectDetailComponent,
      },
      {
        path: 'projects/:projectId/taskList',
        component: MissionOverviewComponent,
        canActivate: [AccessGuard],
        data: { accessRole: [ROLE.MANAGER, ROLE.CLIENT] }
      },
      {
        path: 'projects/:projectId/ticketList',
        component: MissionOverviewComponent,
        canActivate: [AccessGuard],
        data: { accessRole: [ROLE.MANAGER, ROLE.CLIENT] }
      },
      // Task Route
      {
        path: 'campaigns',
        component: CampaignsComponent,
        canActivate: [AccessGuard],
        data: { accessRole: [ROLE.MANAGER, ROLE.ENGINEER] }
      },
      {
        path: 'campaigns/:taskId',
        component: TaskDetailComponent,
      },
      // Ticket Route
      {
        path: 'tickets',
        component: TicketsComponent,
      },
      {
        path: 'tickets/:ticketId',
        component: TicketDetailComponent,
      },
      // {
      //   path: 'documents',
      //   component: DocumentsComponent,
      // },
      // {
      //   path: 'connections',
      //   component: ConnectionsComponent,
      // },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
