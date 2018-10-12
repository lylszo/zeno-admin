import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../shared/service/http.service';
import { CookieService} from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //数据初始化
  mobile;//账号
  password;//密码
  loginForm: FormGroup;

  constructor(private router: Router, private http: HttpService, private cookie: CookieService, private fb: FormBuilder) { }


  ngOnInit() {
    this.init();
  }

  //初始函数
  init(){
    //如果之前设置了自动登录并且有token,则直接进入admin首页
    let autoLoginCookie = this.cookie.get("autoLoginAdmin") ? true : false;
    let token = this.cookie.get('ZenoToken');
    if(autoLoginCookie && token){
      this.router.navigate(['/admin']);
    }

    this.loginForm = this.fb.group({
      mobile: [ null, [ Validators.required ] ],
      password: [ null, [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ],
      autoLogin: [ autoLoginCookie ]
    });      
  }

  //登录
  loginFormSubmitted = false;
  isLoading = false;
  login(){
    this.loginFormSubmitted = true;
    if(this.loginForm.invalid){
      return;
    }
    //设置自动登录
    if(this.loginForm.value.autoLogin){
      let timer = new Date(new Date().getTime() + 30*24*60*60*1000);// 设置有效期30天
      this.cookie.set("autoLoginAdmin", "true", timer); 
    }else{
      this.cookie.delete("autoLoginAdmin");
    }
  	let params = {
  		mobile: this.loginForm.value.mobile,
  		password: this.loginForm.value.password
  	}
    this.isLoading = true;
  	this.http._post("user/login", params, (data) => {
  		let timer = new Date(new Date().getTime() + 24*60*60*1000);// 设置有效期24小时
  		this.cookie.set("ZenoToken", "Bearer " + data.token, timer);  // 登录的时候将token保存在cookie里面
  		this.router.navigate(['/admin']);
      this.isLoading = false;
  	}, err => {
      this.isLoading = false;
    })
  }
  	
	

}
