import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router, private titleService: Title){ }

  ngOnInit(){
  	this.routerTitle();
  }

  //根据路由配置页面title
  navStart: Observable<NavigationStart>;//路由观察对象
  routerTitle(){
  	let titleArr:any = [
		{url: 'login', title: '登录'},
		{url: 'forgetPassword', title: '忘记密码'},
		{url: 'register', title: '注册'},
		{url: 'admin', title: '项目管理'},
		{url: 'admin/project/edit', title: '项目文件管理'},
		{url: 'admin/database', title: '数据表管理'},
		{url: 'admin/person/dataSet', title: '资料设置'},
		{url: 'admin/person/updatePassword', title: '修改密码'}
  	];
  	this.navStart = this.router.events.pipe(
      filter(evt => evt instanceof NavigationStart)
    ) as Observable<NavigationStart>;
    this.navStart.subscribe(e => {
		const initTitle = '铺铺旺数据平台';
		let thisUrl = e.url || '';
		let title = initTitle;
		titleArr.forEach(v => {
			if(e.url.indexOf(v.url) != -1){
				title = `${initTitle}-${v.title}`;
			}
		})
		this.titleService.setTitle(title);
    });
  }
}
