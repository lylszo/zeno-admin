import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { AdminComponent } from './admin.component';

const routes: Routes = [
    {
    	path: 'admin',
    	component: AdminComponent,
	    children: [
          { path: '', loadChildren: './admin-index/admin-index.module#AdminIndexModule' },
	        { path: 'project', loadChildren: './project/project.module#ProjectModule' },
          { path: 'person', loadChildren: './person/person.module#PersonModule' },
          { path: 'database', loadChildren: './database/database.module#DatabaseModule' },
          { path: '**', redirectTo: ''}
	    ]
    },
    { path: 'adminAccount', loadChildren: './account/account.module#AccountModule' },
];

@NgModule({
  imports:[
  	SharedModule,
  	RouterModule.forChild(routes)
  ],
  declarations: [
  	AdminComponent
  ]
})
export class AdminModule { }
