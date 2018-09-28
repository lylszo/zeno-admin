import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/service/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { NzMessageService, UploadFile, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-admin-index',
  templateUrl: './admin-index.component.html',
  styleUrls: ['./admin-index.component.scss']
})
export class AdminIndexComponent implements OnInit {

  constructor(private http: HttpService, private cookie: CookieService, private fb: FormBuilder, private message: NzMessageService, private modalService: NzModalService) { }

  ngOnInit() {
    this.token = this.cookie.get('ZenoToken');
    this.getMyList();
  }
  
  //数据初始化
  key:string;
  list = [];//所有项目列表
  myList = [];//我创建的项目列表
  isSpinning:boolean = false;//是否在请求数据
  token:any;//用于上传图片

  //获取我创建的项目列表
  getMyList(){
    let params:any = {
      page: 1,
      pageSize: 1000
    }
    this.isSpinning = true;
    this.http.get('element/projects', params, data => {
      this.isSpinning = false;
      this.myList = [];
      this.myList = (data && data.items) ? data.items : [];
    }, error => {
      this.isSpinning = false;
    })
  }
  
  //新建/编辑 项目
  newObjTitle = '新建项目';
  newObjModal = false;
  newObjForm: FormGroup;
  activeItem:any;//当前编辑项目
  //打开新建/编辑 项目弹框
  newObj(item){
    if(item){
      this.activeItem = item;
      this.newObjTitle = `编辑项目[${item.id}]`;
      if(item.icon){
        this.fileList = [
          {url: item.icon}
        ];
      }else{
        this.fileList = [];
      }
      this.newObjForm = this.fb.group({
        name: [ item.name, [ Validators.required ] ],
        title: [ item.title, [ Validators.required ] ],
        description: [ item.description, [ Validators.required ] ]
      }); 
    }else{
      this.newObjTitle = '新建项目';
      this.fileList = [];
      this.newObjForm = this.fb.group({
        name: [ '', [ Validators.required ] ],
        title: [ '', [ Validators.required ] ],
        description: [ '', [ Validators.required ] ]
      }); 
    }
    this.newObjModal = true;
    this.newObjFormSubmitted = false;
  }
  //确定新建/编辑 项目
  newObjFormSubmitted = false;//是否点击过提交
  newObjOk(){
    this.newObjFormSubmitted = true;
    if(this.newObjForm.invalid){
      this.message.create('info', '请按提示填写数据');
      return;
    }
    let params:any = {
      name: this.newObjForm.value.name,
      description: this.newObjForm.value.description,
      title: this.newObjForm.value.title
    };
    if(this.fileList.length && this.fileList[0].response){
      params.icon = this.fileList[0].response.url;
    }
    if(this.newObjTitle == '新建项目'){
      this.http.post('element/project', params, data => {
        this.newObjModal = false;
        this.getMyList();
        this.message.create('success', '创建成功！');
        //添加项目主文件
        let fileParams = {
          projectId: data.id,
          type: 'project', 
          content: '{}',
          name: 'home',
          description: '项目主文件'
        }
        this.http.post('element/project/file', fileParams, data => {})
      })      
    }else{
      this.http.put(`element/project/${this.activeItem.id}`, params, data => {
        this.activeItem.name = params.name;
        this.activeItem.title = params.title;
        this.activeItem.description = params.description;
        this.activeItem.icon = params.icon;
        this.newObjModal = false;
        this.message.create('success', '编辑成功！');
      })
    }

  }

  //删除项目
  delItem(item){
    this.modalService.confirm({
      nzTitle: `确定删除项目 "${item.name}" ？`,
      nzOnOk: () => {
        this.http.del(`element/project/${item.id}`, '', data => {
          this.myList = this.myList.filter(v => item.id == v.id ? false : true);
        })
      }
    });
  }

  //上传图片
  fileList = [];
  previewImage = '';
  previewVisible = false;
  //图片预览
  handlePreview = (file: UploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  }

}
