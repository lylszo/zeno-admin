import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../shared/service/http.service';
import { CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-work',
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.scss']
})
export class WorkComponent implements OnInit {

  constructor(private http: HttpService, private cookie: CookieService) { }

  // 数据初始化
  myList = [];
  key:string;
  list = [];

  ngOnInit() {
    this.init();
  }

  //根据获取的项目列表和cookie的数据初始化我的工作表
  init(){
    this.getList(data => {
      if(data.length){
        let cookieIdStr = this.cookie.get('applicationIds');
        if(cookieIdStr){
          let myIds = cookieIdStr.split(',');
          myIds.forEach(v => {
            data.forEach(w => {
              if(v == w.applicationId){
                this.myList.push(w);
                w.check = true;
              }
            })
          })
        }
      }
    });
  }

  //获取列表
  getList(callback?){
    let params:any = {
      page: 1,
      pageSize: 1000
    };
    this.key ? params.keyword = this.key.trim() : false;
    this.http._get('element/application', params, data => {
      this.list = [];
      this.list = (data && data.items) ? data.items : [];
      callback ? callback(this.list) : false;
    })
  }

  // 添加项目
  add(item){
  	item.check = true;
    if(!this.myList.includes(item.applicationId)){
      this.myList = [...this.myList, item];
      let oldIdStr = this.cookie.get('applicationIds');
      let timer = new Date(+`${new Date('2088-8-8').getTime()}`);
      if(oldIdStr){
        this.cookie.set('applicationIds', `${oldIdStr},${item.applicationId}`, timer);
      }else{
        this.cookie.set('applicationIds', `${item.applicationId}`, timer);
      }
    }
  }

  //删除项目
  del(item, idx){
    item.check = false;
    this.myList.splice(idx, 1);
  }

  //点击获取对象项目的url
  getUrl(item){
    let newPage = window.open();
    newPage.document.write('<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>正在跳转......</title> </head> <body> <h4 style="text-align: center">正在跳转，请稍候......</h4> </body> </html>');
    this.http.get(`application/${item.applicationId}`, '', data => {
      newPage.location.href = data.homeUrl;
    })
  }

}
