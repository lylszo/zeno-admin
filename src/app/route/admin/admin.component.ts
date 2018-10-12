import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService} from 'ngx-cookie-service';
import { CommonService } from '../../shared/service/common.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy  {

  constructor(private router: Router, private cookie: CookieService, private common: CommonService) { }

  ngOnInit() {
    this.getMyInfo();
  }

  //获取个人详情
  user:any = {};
  userInfoObserver;//用户信息观察者对象
  getMyInfo(){
    this.userInfoObserver = this.common.getUserInfo(data => {
      this.user = data;
    })
  }

  //退出登录
  logout(){
  	this.cookie.delete('ZenoToken');
  	this.router.navigate(['/login']);
  }

  //组件销毁前取消订阅用户信息
  ngOnDestroy(){
    this.userInfoObserver.unsubscribe();
  }

}
