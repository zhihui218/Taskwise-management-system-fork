import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
  NgbDropdownModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationModule } from '../../modules/i18n';
import { LayoutComponent } from './layout.component';
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { Routing } from '../../pages/routing';
import { AsideComponent } from './components/aside/aside.component';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { AsideMenuComponent } from './components/aside/aside-menu/aside-menu.component';
import { TabsAsideComponent } from './components/aside/tabs-aside/tabs-aside.component';
import { TabsAsideInnerComponent } from './components/aside/tabs-aside/tabs-aside-inner.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ChatHistoryComponent } from 'src/app/utils/chat-history/chat-history.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';
import {
  DrawersModule,
  DropdownMenusModule,
  ModalsModule,
  EngagesModule,
} from '../partials';
import { EngagesComponent } from '../partials/layout/engages/engages.component';
import { AuthorsTabComponent } from './components/aside/tabs/authors-tab/authors-tab.component';
import { MenuTabComponent } from './components/aside/tabs/menu-tab/menu-tab.component';
import { NotificationsTabComponent } from './components/aside/tabs/notifications-tab/notifications-tab.component';
import { ProjectsTabComponent } from './components/aside/tabs/projects-tab/projects-tab.component';
import { SubscriptionsTabComponent } from './components/aside/tabs/subscriptions-tab/subscriptions-tab.component';
import { TasksTabComponent } from './components/aside/tabs/tasks-tab/tasks-tab.component';
import { SearchComponent } from './components/aside/tabs/projects-tab/search/search.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { UpdateUserDetailComponent } from 'src/app/form-modal/update-user-detail/update-user-detail.component';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    // MonthlyReportComponent,
    AsideComponent,
    HeaderComponent,
    ContentComponent,
    FooterComponent,
    ChatHistoryComponent,
    ScriptsInitComponent,
    ToolbarComponent,
    AsideMenuComponent,
    TopbarComponent,
    PageTitleComponent,
    HeaderMenuComponent,
    EngagesComponent,
    TabsAsideComponent,
    TabsAsideInnerComponent,
    AuthorsTabComponent,
    MenuTabComponent,
    NotificationsTabComponent,
    ProjectsTabComponent,
    SubscriptionsTabComponent,
    TasksTabComponent,
    SearchComponent,
    UpdateUserDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslationModule,
    InlineSVGModule,
    AvatarModule,
    SkeletonModule,
    BadgeModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    BadgeModule,
    ExtrasModule,
    ModalsModule,
    DrawersModule,
    EngagesModule,
    DropdownMenusModule,
    NgbTooltipModule,
    TranslateModule,
    OverlayPanelModule,
    MenuModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModeModule,
    DynamicDialogModule
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
