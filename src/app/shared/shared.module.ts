import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

import { ServiceModule } from './service/service.module';
import { PipeModule } from './pipe/pipe.module';
import { DirectiveModule } from './directive/directive.module';
import { ComponentModule } from './component/component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceModule.forRoot(),
  	PipeModule,
  	DirectiveModule,
  	ComponentModule,
    NgZorroAntdModule.forRoot()
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  	PipeModule,
  	DirectiveModule,
  	ComponentModule,
  	NgZorroAntdModule
  ],
  providers: [
  	{ provide: NZ_I18N, useValue: zh_CN }
  ]
})
export class SharedModule { }
