import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

import { AdminIndexComponent } from './admin-index.component';

const routes: Routes = [
    { path: '', component: AdminIndexComponent }
];

@NgModule({
	imports: [
		SharedModule,
        RouterModule.forChild(routes)
	],
	declarations: [
		AdminIndexComponent
	]
})
export class AdminIndexModule { }
