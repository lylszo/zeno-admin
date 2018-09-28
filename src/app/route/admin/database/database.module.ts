import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

import { TableManageComponent } from './table-manage/table-manage.component';

const routes: Routes = [
    { path: '', component: TableManageComponent }
];

@NgModule({
	imports: [
		SharedModule,
        RouterModule.forChild(routes)
	],
	declarations: [
		TableManageComponent
	]
})
export class DatabaseModule { }
