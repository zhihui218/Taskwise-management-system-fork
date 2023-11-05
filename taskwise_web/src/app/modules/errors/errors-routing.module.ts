import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './error404/error404.component';
import { Error500Component } from './error500/error500.component';
import { ErrorsComponent } from './errors.component';
import { Error401Component } from './error401/error401.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorsComponent,
    children: [
      {
        path: '401',
        component: Error401Component
      },
      {
        path: '404',
        component: Error404Component,
      },
      {
        path: '500',
        component: Error500Component,
      },
      { path: '', redirectTo: '404', pathMatch: 'full' },
      { path: '**', redirectTo: '404', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErrorsRoutingModule {}
