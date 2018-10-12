import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpService } from '../../../../shared/service/http.service';
import { ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService, NzDropdownContextComponent, NzDropdownService } from 'ng-zorro-antd';
declare let JSONEditor: any;

@Component({
  selector: 'app-project-files',
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.scss']
})
export class ProjectFilesComponent implements OnInit {
  
  constructor(private route: ActivatedRoute, private http: HttpService, private nzDropdownService: NzDropdownService, private modalService: NzModalService, private message: NzMessageService) {
  }

  // 初始化数据
  project:any = {};
  id:any;
  projects:any = [];
  projectsExpanded:boolean = true;
  pages:any = [];
  pagesExpanded:boolean = true;
  views:any = [];
  viewsExpanded:boolean = true;
  tags:any = [];
  tagsExpanded:boolean = true;
  events:any = [];
  eventsExpanded:boolean = true;
  services:any = [];
  servicesExpanded:boolean = true;

  ngOnInit() {
    this.id = +this.route.snapshot.params.id;
    this.getFiles();
    this.getTemplates();
  }

  ngAfterViewInit(){
    this.initJson();
  }

  getFiles(){
    this.http.get(`element/project/${this.id}`, '', data => {
      this.project = data;
      this.projects = data.fileList.filter(v => v.type == 'project');
      this.pages = data.fileList.filter(v => v.type == 'page');
      this.views = data.fileList.filter(v => v.type == 'view');
      this.tags = data.fileList.filter(v => v.type == 'tag');
      this.events = data.fileList.filter(v => v.type == 'event');
      this.services = data.fileList.filter(v => v.type == 'service');
      this.fileEdit(this.projects[0]);
    })
  }

  // 数据初始化
  private dropdown: NzDropdownContextComponent;
  list = [];
  editor:any;//编辑器对象

  //初始化json编辑器
  initJson(){
    let container = document.getElementById("jsoneditor");
    let options = {
      indentation: 4,
      mode: 'code',
      onError: err => {
        this.message.create('error', err.toString());
      }
    };
    this.editor = new JSONEditor(container, options);

  }

  //点击文件
  file:any;//当前显示文件
  clickFiles:any = [];//已点击文件id数组
  fileEdit(file){
    //先保存下当前编辑框里的内容
    if(this.file){
      this.file.content = this.editor.getText();
    }
    
    //根据文件id获取文件内容，同一文件只发起一次请求
    let repeatArr = this.clickFiles.filter(v => v == file.id);
    if(repeatArr.length){
      this.file = file;
      this.editor.updateText(file.content);
    }else{
      this.http.get(`element/project/file/${file.id}`, '', data => {
        this.clickFiles.push(data.id);
        file.content = data.content;
        this.file = file;
        let jsonObj;
        try {
          jsonObj = JSON.parse(data.content);
        }catch(err) {
          jsonObj = {};
        }
        this.editor.set(jsonObj);    
      })      
    }
  }

  //右键显示指定下拉菜单
  activeItem:any; //右键选中的项目
  activeSort:string = ''; //右键选中的项目对应的父级项目
  contextMenu($event, template, sort, item?): void {
    this.activeSort = sort;
    this.activeItem = item;
    this.dropdown = this.nzDropdownService.create($event, template);
  }

  //重命名
  renameModal = false;
  newName = '';
  //打开重命名弹框
  rename(){
    this.renameModal = true;
    this.newName = this.activeItem.name;
    this.dropdown.close();
  }
  //确定重命名
  renameOk(){
    let newName = this.newName.trim();
    if(!newName){
      this.message.create('warning', '文件名不能为空！');
      return;
    }
    let nameRepeatArr = this[this.activeSort + 's'].filter(v => {
      if(v.name == newName && v.name != this.activeItem.name){
        return true;
      }
    });
    if(nameRepeatArr.length){
      this.message.create('warning', '同级文件的名称不能重复！');
      return;
    }
    if(newName){
      let params = {
        name: newName
      }
      this.http.put(`element/project/filedesc/${this.activeItem.id}`, params, data => {
        this.activeItem.name = newName;
        this.renameModal = false;
      })
    }
  }

  //新建文件  
  newFileModal = false;
  newFileName;
  template;
  //打开新建文件弹框
  newFile(){
    this.getTemplates(this.activeSort);
    this.newFileName = '';
    this.template = undefined;
    this.newFileModal = true;
    this.dropdown.close();
  }
  //确定新建文件弹框
  newFileOk(){
    let newFileName = this.newFileName.trim();
    if(!newFileName){
      this.message.create('warning', '文件名不能为空！');
      return;
    }
    let nameRepeatArr = this[this.activeSort + 's'].filter(v => v.name == newFileName);
    if(nameRepeatArr.length){
      this.message.create('warning', '同级文件的名称不能重复！');
      return;
    }

    let fileParams = {
      projectId: this.id,
      type: this.activeSort, 
      content: '{}',
      name: newFileName
    }
    if(this.template){
      fileParams.content = this.template;
    }
    this.http.post('element/project/file', fileParams, data => {
      this.newFileModal = false;
      this[this.activeSort + 's'].push(data);
      this.fileEdit(data);
      this[this.activeSort + 'sExpanded'] = true;
    })
  }

  //删除文件  
  delFile(){
    this.dropdown.close();
    this.modalService.confirm({
      nzTitle: `确定删除文件 "${this.activeItem.name}" ？`,
      nzOnOk: () => {
        this.http.del(`element/project/file/${this.activeItem.id}`, '', data => {
          let idx: number;
          this[this.activeSort + 's'].forEach((v, i) => {
            if(this.activeItem.id == v.id){
              idx = i;
            }
          })
          this[this.activeSort + 's'].splice(idx, 1);          
        })
      }
    });
  }

  //保存当前文件内容
  save(){
    if(!this.file){
      this.message.create('info', '请先选择文件');
      return;
    }
    let text = JSON.stringify(this.editor.get());
    try {
      JSON.parse(text);
    }catch(err) {
      this.message.create('error', 'json数据格式有误，请检查后重试！');
      return;
    }
    this.http.put(`element/project/filecontent/${this.file.id}`, text, data => {
      this.message.create('success', '已保存');
    })
  }

  //获取模板
  allTemplates:any = [];//所有模板的数组
  templatesResult:any = {};//所有模板的对象
  templates:any = [];//当前类型可选模板
  requestTemplate:boolean = false;//是否已经请求了模板接口
  getTemplates(type?){
    if(!this.requestTemplate){
      let params = {
        page: 1, 
        pageSize: 1000
      };
      this.http.get('element/tags', params, data => {
        this.requestTemplate = false;
        // this.allTemplates = (data && data.items) ? data.items : [];
        this.allTemplates = [
          {name: 'project-template1', type: 'project', template: '{"name": "project-template"}'},
          {name: 'page-template1', type: 'page', template: '{"name": "page-template1"}'},
          {name: 'page-template2', type: 'page', template: '{"name": "page-template2"}'},
          {name: 'page-template3', type: 'page', template: '{"name": "page-template3"}'},
          {name: 'page-template4', type: 'page', template: '{"name": "page-template4"}'},
          {name: 'view-template1', type: 'view', template: '{"name": "view-template"}'},
          {name: 'tag-template1', type: 'tag', template: '{"name": "tag-template"}'},
          {name: 'event-template1', type: 'event', template: '{"name": "event-template"}'},  
          {name: 'service-template1', type: 'service', template: '{"name": "service-template"}'}
        ];
        this.templatesResult = {
          projects: this.allTemplates.filter(v => v.type == 'project'), 
          pages: this.allTemplates.filter(v => v.type == 'page'), 
          views: this.allTemplates.filter(v => v.type == 'view'), 
          tags: this.allTemplates.filter(v => v.type == 'tag'), 
          events: this.allTemplates.filter(v => v.type == 'event'), 
          services: this.allTemplates.filter(v => v.type == 'service')
        }
        if(type){
          this.templates = this.allTemplates[type];
        }
      })      
    }else{
      if(type){
        this.templates = this.allTemplates[type];
      }
    }
  }

  //打开选择模板右侧框
  showTemplateBox = false;
  //关键词过滤模板文件
  templateKey:any;//关键词
  getTemplatesByKey($event){
    let key = $event ? $event.trim() : '';
    this.templatesResult = {
      projects: this.allTemplates.filter(v => (v.type == 'project' && v.name.indexOf(key) != -1)), 
      pages: this.allTemplates.filter(v => (v.type == 'page' && v.name.indexOf(key) != -1)), 
      views: this.allTemplates.filter(v => (v.type == 'view' && v.name.indexOf(key) != -1)), 
      tags: this.allTemplates.filter(v => (v.type == 'tag' && v.name.indexOf(key) != -1)), 
      events: this.allTemplates.filter(v => (v.type == 'event' && v.name.indexOf(key) != -1)), 
      services: this.allTemplates.filter(v => (v.type == 'service' && v.name.indexOf(key) != -1))
    }
  }
  //使用模板（直接覆盖当前文件）
  useTemplate(item){
    let jsonObj;
    try {
      jsonObj = JSON.parse(item.template);
    }catch(err) {
      jsonObj = {};
    }
    this.editor.set(jsonObj);   
  }
  //查看模板预览图
  previewVisible = false;//显示预览模态框
  templatePic(){
    this.previewVisible = true;
  }

  //查看模板详情
  detailTitle = '模板详情';
  templateDetailModal = false;
  activeTemplate = '';//当前模板
  templateDetail(item){
    this.activeTemplate = item.remark || '';
    this.templateDetailModal = true;
    this.detailTitle = '模板详情 - ' + item.name;
  }

  //编译
  compile(){
    this.http.post(`element/compile/${this.id}`, '', data => {
      this.message.create('success', '编译成功！');
    })
    this.dropdown.close();
  }

}
