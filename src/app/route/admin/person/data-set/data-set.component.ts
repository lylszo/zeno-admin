import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/service/http.service';
import { CommonService } from '../../../../shared/service/common.service';
import { CookieService } from 'ngx-cookie-service';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';

@Component({
  selector: 'app-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.scss']
})
export class DataSetComponent implements OnInit, OnDestroy {

  constructor(private cookie: CookieService, private fb: FormBuilder, private common: CommonService, private http: HttpService, private message: NzMessageService) { }

  // 数据初始化
  dataForm: FormGroup;
  userInfo:any = {};
  showForm = false;
  districts:any = [];
  avatar:any = {};//当前的头像信息
  userInfoObserver;//用户信息观察者
  cityInfoObserver;//城市信息观察者

  ngOnInit() {
    this.init();
  }

  //初始函数
  init(){
    // 获取用户详情
    this.userInfoObserver = this.common.getUserInfo(data => {
      this.showForm = true;
      this.userInfo = data;
      this.avatar = data.photo;
      let workCity = data.workingCity.code ? data.workingCity.code + '' : null;
      this.dataForm = this.fb.group({
          name: [ data.name, [ Validators.required ] ],
          workCity: [ workCity, [ Validators.required ] ],
          mobile: [ {value: data.mobile, disabled: true} ]
      }); 
    })
    //获取所有省和城市
    this.cityInfoObserver = this.common.getCityInfo(data => {
      this.districts = data;
    });
  }


  //上传图片
  token = this.cookie.get('ZenoToken');
  beforeUpload = (file: File) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      this.message.warning('请上传小于1M的图片!');
    }
    return isLt1M;
  }
  handleChange($event): void {
    if($event.type == "success"){
      this.avatar = $event.file.response;
    }
  }

  //修改用户信息
  dataFormSubmitted = false;
  updateData(){
    this.dataFormSubmitted = true;
    if(this.dataForm.invalid){
      this.message.create('warning', '请按提示正确填写数据！');
      return;
    }
    let params:any = {};
    if(this.avatar.id && (this.userInfo.photo && this.avatar.id != this.userInfo.photo.id || !this.userInfo.photo)){
      params.photoId = this.avatar.id;
    }
    if(this.dataForm.value.name && this.dataForm.value.name != this.userInfo.name){
      params.name = this.dataForm.value.name;
    }
    if(this.dataForm.value.workCity && this.dataForm.value.workCity != this.userInfo.workingCity.code){
      params.workingCityId = this.dataForm.value.workCity;
    }
    if(JSON.stringify(params) == '{}'){
      this.message.create('warning', '信息未进行任何修改');
      return;
    }
    this.http.post('user/myself', params, data => {
      this.common.updateUserInfo();
      this.message.create('success', '更新资料成功！');
    })
  }

  //更换绑定手机
  changePhoneModal = false;
  changePhoneForm: FormGroup;
  changePhone(){
    this.changePhoneModal = true;
    this.changePhoneForm = this.fb.group({
      oldMobile: [ {value: this.userInfo.mobile, disabled: true} ],
      oldVcode: [ null, [ Validators.required ] ],
      mobile: [ null, [ Validators.required, Validators.pattern(/^1[3-9]\d{9}$/) ] ],
      vcode: [ null, [ Validators.required ] ]
    });
    //重置数据
    this.vcodeText = '发送验证码';
    this.oldVcodeText = '发送验证码';
    this.vcodeTimer = 60;
    this.oldVcodeTimer = 60;
  }
  //更换手机确定
  changePhoneFormSubmitted = false;
  changePhoneOk(){
    this.changePhoneFormSubmitted = true;
    if(this.changePhoneForm.invalid){
      this.message.create('warning', '请按提示正确填写数据！');
      return;
    }
    let params = {
      mobile: this.changePhoneForm.value.mobile,
      oldVcode: this.changePhoneForm.value.oldVcode,
      vcode: this.changePhoneForm.value.vcode
    }   
    this.http.put('user/setMobile', params, data => {
      this.message.create('success', '更换手机成功！');
      this.userInfo.mobile = params.mobile;
      this.dataForm = this.fb.group({
        name: [ this.userInfo.name, [ Validators.required ] ],
        workCity: [ (this.userInfo.workingCity.code ? this.userInfo.workingCity.code + '' : null), [ Validators.required ] ],
        mobile: [ {value: this.userInfo.mobile, disabled: true} ]
      });
      this.changePhoneModal = false;
    })
  }

  //获取 验证码
  vcodeText = '发送验证码';
  oldVcodeText = '发送验证码';
  vcodeTimer = 60;
  oldVcodeTimer = 60;
  getVcode(old){
    let params = {
      mobile: old ? this.userInfo.mobile : this.changePhoneForm.value.mobile,
      purpose: 'SET_MOBILE'
    };
    this.http._post('vcode/send_sms', params, (data) => {
      if (data) {
        this.message.create('info', '验证码已发送，请注意查收！');
        old ? this.oldVcodeText = `已发送（${this.oldVcodeTimer}）` : this.vcodeText = `已发送（${this.vcodeTimer}）`;
        let intervalCode = setInterval(() => {
          old ? this.oldVcodeTimer-- : this.vcodeTimer--;
          old ? this.oldVcodeText = `已发送（${this.oldVcodeTimer}）` : this.vcodeText = `已发送（${this.vcodeTimer}）`;
          if(this.vcodeTimer == 0){
            clearInterval(intervalCode);
            old ? this.oldVcodeText = '再次发送验证码' : this.vcodeText = '再次发送验证码';
          }
        }, 1000)
      }
    });
  }

  //组件销毁前取消订阅信息
  ngOnDestroy(){
    this.userInfoObserver.unsubscribe();
    this.cityInfoObserver.unsubscribe();
  }

}
