import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/service/http.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {

  constructor(private http: HttpService, private fb: FormBuilder, private message: NzMessageService, private router: Router) { }

  // 数据初始化
  passwordForm: FormGroup;
  passwordFormSubmitted = false;

  ngOnInit() {
  	this.passwordForm = this.fb.group({
        password: [ '', [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ],
        new_password: [ '', [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ],
        repeatPassword: [ '', [ Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,12}$/) ] ]
  	}); 
  }

  //确认修改
  updatePassword(){
  	this.passwordFormSubmitted = true;
  	if(this.passwordForm.invalid || 
  	   !this.passwordForm.get('new_password').value || 
  	   !this.passwordForm.get('repeatPassword').value || 
  	   this.passwordForm.get('new_password').value != this.passwordForm.get('repeatPassword').value){
  	   	this.message.create('warning', '请按提示填写数据！');
  		return;
  	}
  	let param = {
      password: this.passwordForm.value.password,
      new_password: this.passwordForm.value.new_password
    };
    this.http.post('user/setPassword', param, () => {
      this.message.create('success', '修改成功，请重新登录！');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000)
    })
  }

}
