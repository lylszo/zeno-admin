/*
  本服务提供请求后台的一系列方法
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  /*数据初始化*/
  bathUrl: string = 'http://zeno.xwkj.local:9005/openapi/';//测试环境api接口路径
  // bathUrl: string = 'http://zeno-api.xw18.cn/openapi/';//线上环境api接口路径
  headers: any;//请求头

  constructor(private http: HttpClient, private cookie: CookieService, private router:Router, private message: NzMessageService) {
  }

  // 设置header
  setHeaders(sort?) {
    if(!sort){
      this.headers = new HttpHeaders({'Content-Type': 'application/json;charset=UTF-8'});
    }else{
      let token = this.cookie.get('ZenoToken'); 
      if(token){
        if(sort == 'auth'){
          this.headers = new HttpHeaders({'Authorization': token, 'Content-Type': 'application/json;charset=UTF-8'});
        }else if(sort == 'pic'){
          this.headers = new HttpHeaders({'Authorization': token});
        }
      }else{
        this.router.navigate(['/']);
      }
    }
  }

  //错误处理
  handleError(error) {
    if(error.error && error.error.code==="1000"){
      this.message.create('error', '系统异常，请稍后重试！');
    }else{
      let errTxt = (error.error && error.error.message) ? error.error.message : `${error.status}：服务器繁忙，请稍后重试！`;
      this.message.create('error', errTxt);
    }
    //token无效返回首页
    if(error.error && error.error.code === "1002"){
      this.router.navigate(['/']);
    }
  }

  // 需要token的post请求
  post(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders('auth');
    return this.http.post(this.bathUrl + path, params, {headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // 不需要token的post请求
  _post(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders();
    return this.http.post(this.bathUrl + path, params, {headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // 上传图片
  picPost(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders('pic');
    return this.http.post(this.bathUrl + path, params, {headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // 需要token的get请求
  get(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders('auth');
    return this.http.get(this.bathUrl + path, {params: params, headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // 不需要get请求,返回值为text
  getText(path: string, params: any, callback: Function, err?: Function) {
    return this.http.get(this.bathUrl + path, {responseType: 'text'})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // 不需要token的get请求
  _get(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders();
    return this.http.get(this.bathUrl + path, {params: params, headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // del请求
  del(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders('auth');
    return this.http.delete(this.bathUrl + path, {params: params, headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

  // put请求
  put(path: string, params: any, callback: Function, err?: Function) {
    this.setHeaders('auth');
    return this.http.put(this.bathUrl + path, params, {headers: this.headers})
      .subscribe(data => {
        callback(data);
      }, error => {
        this.handleError(error);
        err ? err(error.error) : false;
      });
  }

}
