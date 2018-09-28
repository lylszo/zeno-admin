import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService} from 'ngx-cookie-service';
import { HttpService } from '../../shared/service/http.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(private router: Router, private cookie: CookieService, private http: HttpService) { }

  ngOnInit() {
    this.getMyInfo();
  }

  //获取个人详情
  user:any = {};
  getMyInfo(){
    this.http.get('user/0', '', data => {
      this.user = data;
    })
  }

  //退出登录
  logout(){
  	this.cookie.deleteAll();
  	this.router.navigate(['/adminAccount/login']);
  }

}
