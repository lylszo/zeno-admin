import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { ObjComponent } from './obj.component';

const routes: Routes = [
    { path: 'obj', component: ObjComponent }
];

@NgModule({
  imports:[
  	SharedModule,
  	RouterModule.forChild(routes)
  ],
  declarations: [
  	ObjComponent
  ]
})
export class ObjModule { }
