import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../shared/service/http.service';
import { CommonService } from '../../../../shared/service/common.service';
import { CookieService} from 'ngx-cookie-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
	//数据初始化
  	mobile;//账号
  	password;//密码
  	districts = [];//所有省和城市
  	registerForm: FormGroup;
  	cityInfoObserver;//城市信息观察者

	constructor(private router: Router, private common: CommonService, private http: HttpService, private cookie: CookieService, private fb: FormBuilder, private message: NzMessageService) { }

	ngOnInit() {
		this.init();
  	}

	//初始函数
	init(){
		let token = this.cookie.get('ZenoToken');
		this.registerForm = this.fb.group({
		  	name: [ null, [ Validators.required, Validators.pattern(/^.{1,10}$/)] ],
		  	mobile: [ null, [ Validators.required, Validators.pattern(/^1[3-9]\d{9}$/) ] ],
		  	vcode: [ null, [ Validators.required ] ],
		  	workCity: [ null, [ Validators.required ] ],
		  	password: [ null, [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ],
		  	passwordAgain: [ null, [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ]
		});   
		//获取所有省和城市
	    this.cityInfoObserver = this.common.getCityInfo(data => {
	      this.districts = data;
	    });
	}

	//获取 验证码
	vcodeText = '发送验证码';
	vcodeTimer = 60;
	getVcode(){
		let params = {
			'mobile': this.registerForm.value.mobile,
			'purpose': 'REGISTER'
		};
		this.http._post('vcode/send_sms', params, (data) => {
			if (data) {
				this.message.create('info', '验证码已发送，请注意查收！');
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

	//登录
	registerFormSubmitted = false;
	isLoading = false;
	register(){
		this.registerFormSubmitted = true;
		if(this.registerForm.invalid || this.registerForm.value.password != this.registerForm.value.passwordAgain){
		  	return;
		}
		let params = {
			name: this.registerForm.value.name,
			mobile: this.registerForm.value.mobile,
			password: this.registerForm.value.password,
			vcode: this.registerForm.value.vcode,
			workCity: +this.registerForm.value.workCity
		}
		this.isLoading = true;
		this.http._post("user/register", params, (data) => {
			this.message.create('success', '注册成功, 请登录！');
			this.router.navigate(['/login']);
			this.isLoading = false;
		}, err => {
			this.isLoading = false;
		})
	}

	//组件销毁前取消订阅信息
	ngOnDestroy(){
		this.cityInfoObserver.unsubscribe();
	}

}
