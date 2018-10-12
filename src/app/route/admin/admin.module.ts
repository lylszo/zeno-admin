import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { AdminComponent } from './admin.component';
import { LoginComponent } from './account/login/login.component';
import { ForgetPasswordComponent } from './account/forget-password/forget-password.component';
import { RegisterComponent } from './account/register/register.component';

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
    { path: 'login', component: LoginComponent },
    { path: 'forgetPassword', component: ForgetPasswordComponent },
    { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports:[
  	SharedModule,
  	RouterModule.forChild(routes)
  ],
  declarations: [
  	AdminComponent,
    LoginComponent,
    ForgetPasswordComponent,
    RegisterComponent
  ]
})
export class AdminModule { }
