import { NgModule } from '@angular/core';

import { DatePipe } from "@angular/common";
import { ColumnTypePipe } from './column-type.pipe';
import { RelationTypePipe } from './relation-type.pipe';

@NgModule({
  providers: [
  	DatePipe
  ],
  declarations: [
  	ColumnTypePipe,
  	RelationTypePipe
  ],
  exports: [
  	ColumnTypePipe,
  	RelationTypePipe
  ]
})
export class PipeModule { }