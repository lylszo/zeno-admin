import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

import { ProjectFilesComponent } from './project-files/project-files.component';

const routes: Routes = [
    { path: 'edit/:id', component: ProjectFilesComponent }
];

@NgModule({
	imports: [
		SharedModule,
        RouterModule.forChild(routes)
	],
	declarations: [
		ProjectFilesComponent
	]
})
export class ProjectModule { }
