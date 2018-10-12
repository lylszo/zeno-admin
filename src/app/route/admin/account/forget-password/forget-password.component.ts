import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../shared/service/http.service';
import { CookieService} from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
	//数据初始化
	mobile;//账号
	password;//密码
	passForm: FormGroup;

  	constructor(private router: Router, private http: HttpService, private cookie: CookieService, private fb: FormBuilder, private message: NzMessageService) { }

  	ngOnInit() {
  		this.init();
  	}

  	//初始函数
	init(){
		let token = this.cookie.get('ZenoToken');
		this.passForm = this.fb.group({
		    mobile: [ null, [ Validators.required, Validators.pattern(/^1[3-9]\d{9}$/) ] ],
		    vcode: [ null, [ Validators.required ] ],
		  	password: [ null, [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ],
		  	passwordAgain: [ null, [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ]
		});      
	}

	//获取 验证码
	vcodeText = '发送验证码';
	vcodeTimer = 60;
	getVcode(){
		let params = {
			'mobile': this.passForm.value.mobile,
			'purpose': 'REGISTER'
		};
		this.http._post('vcode/send_sms', params, (data) => {
			if (data) {
				this.message.create('info', '验证码已发送，请注意查收！');
				this.passForm.value.vcode = data;
				this.vcodeText = `已发送（${this.vcodeTimer}）`;
				let intervalCode = setInterval(() => {
					this.vcodeTimer--;
					this.vcodeText = `已发送（${this.vcodeTimer}）`;
					if(this.vcodeTimer == 0){
						clearInterval(intervalCode);
						this.vcodeText = '再次发送验证码';
					}
				}, 1000)
			}
		});
	}

	//更新密码
	passFormSubmitted = false;
	isLoading = false;
	updatePassWord(){
		this.passFormSubmitted = true;
		if(this.passForm.invalid || this.passForm.value.password != this.passForm.value.passwordAgain){
		    return;
		}
		let params = {
	        mobile: this.passForm.value.mobile,
	        newPassword: this.passForm.value.password,
	        repeatPassword: this.passForm.value.passwordAgain,
	        verifyCode: +this.passForm.value.vcode
      	};
      	this.isLoading = true;
      	this.http._post("user/resetPassword", params, (data) => {
	        this.message.create('success', '重置密码成功! 请重新登录');
	        this.router.navigate(['/login']);
	        this.isLoading = false;
      	}, err => {
      		this.isLoading = false;
      	})
	}

}
