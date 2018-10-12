import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminModule } from './admin/admin.module';
import { HomeModule } from './home/home.module';

@NgModule({
  imports: [
    RouterModule.forRoot([]),
    AdminModule,
    HomeModule
  ],
  exports: [
  	RouterModule
  ],
  declarations: []
})
export class RouteModule { }
