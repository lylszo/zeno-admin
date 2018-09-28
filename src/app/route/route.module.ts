import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminModule } from './admin/admin.module';
import { ObjModule } from './obj/obj.module';
import { WorkModule } from './work/work.module';

@NgModule({
  imports: [
    RouterModule.forRoot([]),
    AdminModule,
    ObjModule,
    WorkModule
  ],
  exports: [
  	RouterModule
  ],
  declarations: []
})
export class RouteModule { }
