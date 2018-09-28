import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { WorkComponent } from './work.component';

const routes: Routes = [
    { path: '', component: WorkComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports:[
  	SharedModule,
  	RouterModule.forChild(routes)
  ],
  declarations: [
  	WorkComponent
  ]
})
export class WorkModule { }
