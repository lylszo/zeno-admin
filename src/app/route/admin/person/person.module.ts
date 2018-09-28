import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

import { DataSetComponent } from './data-set/data-set.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';

const routes: Routes = [
    { path: 'dataSet', component: DataSetComponent },
    { path: 'updatePassword', component: UpdatePasswordComponent }
];

@NgModule({
  imports:[
  	RouterModule.forChild(routes),
  	SharedModule
  ],
  declarations: [
  	DataSetComponent,
  	UpdatePasswordComponent
  ]
})
export class PersonModule { }
