/*
	本服务提供获取项目中多次使用的一些数据
*/
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  	providedIn: 'root'
})
export class CommonService {

 	constructor(private http: HttpService) { }

  	//用户信息
  	userInfo:any = {};
  	userInfo$ = new Subject();
  	//获取当前用户信息,如果已经请求了用户信息就返回之前请求的数据
  	getUserInfo(callback){
      let thisSubscrible = this.userInfo$.subscribe(data => {
        callback(data);
      })
  		if(JSON.stringify(this.userInfo) == '{}'){
	  		this.updateUserInfo();			
  		}else{
  			this.userInfo$.next(this.userInfo);
  		}
      return thisSubscrible;
  	}
  	//更新当前用户信息，多播给所有订阅者
  	updateUserInfo(){
  		this.http.get('user/0', '', data => {
  			this.userInfo = data;
      	this.userInfo$.next(data);
	    }) 
  	}


    //城市信息【城市包含于省份信息中】
    cityInfo:any = [];
    cityInfoObserver;
    cityInfo$ = new Observable(observer => {
      this.cityInfoObserver = observer;
      if(!this.cityInfo.length){
        this.http._get('district', {parent_id: -1}, data => {
          let allDistricts = data || [];
          let province = [];
          let cities = [];
          allDistricts.forEach(v => {
            if(v.code < 100){
              province.push(v);
            }else if(v.code < 10000){
              cities.push(v);
            }
          })
          province.forEach(v => {
            v.child = [];
            cities.forEach(w => {
              if((w.code + '').slice(0, 2) == v.code){
                v.child.push(w);
              }
            })
          })
          this.cityInfo = province;
          observer.next(province);
        })
      }else{
        observer.next(this.cityInfo);
      }
    });
    //获取城市信息,如果已经请求了则返回之前请求的数据
    getCityInfo(callback){
      let thisSubscrible = this.cityInfo$.subscribe(data => {
        callback(data);
      })
      return this.cityInfoObserver;
    }



}
