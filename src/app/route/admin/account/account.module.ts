import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../../shared/shared.module';

import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgetPassword', component: ForgetPasswordComponent },
    { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [
  	RouterModule.forChild(routes),
  	SharedModule
  ],
  declarations: [
  	LoginComponent,
  	ForgetPasswordComponent,
  	RegisterComponent
  ]
})
export class AccountModule { }
