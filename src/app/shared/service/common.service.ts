/*
	本服务提供获取项目中多次使用的一些数据
*/
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  	providedIn: 'root'
})
export class CommonService {

 	constructor(private http: HttpService) {
 		this.http.get('user/0', '', data => {
	      	this.userInfo$.next(data);
	    })
 	}

  	//用户信息
  	userInfo$ = new Subject();
  	//获取当前用户信息
  	getUserInfo(callback){
		this.userInfo$.subscribe(data => {
			callback(data);
		})
  	}



}
