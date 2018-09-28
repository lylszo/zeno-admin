import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/service/http.service';
import { NzMessageService, NzDropdownService, NzDropdownContextComponent, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-table-manage',
  templateUrl: './table-manage.component.html',
  styleUrls: ['./table-manage.component.scss']
})
export class TableManageComponent implements OnInit {

  constructor(private http: HttpService, private nzDropdownService: NzDropdownService, private fb: FormBuilder, private message: NzMessageService, private modalService: NzModalService) { }

  // 数据初始化
  expanded = true;// 是否展开列表
  list:any = [];// 表列表
  columnTypeList:any = [];// 字段类型列表 
  relationTypeList:any = [];//表关系类型列表
  objList:any = [];//所有项目列表
  dropdown: NzDropdownContextComponent;// 下拉菜单
  targetTables:any = [];//目标表
  targetColumns:any = [];//目标字段

  ngOnInit() {
    this.columnTypeList = [
      {code: 1, name: 'int'},
      {code: 2, name: 'long'},
      {code: 3, name: 'string'},
      {code: 4, name: 'boolean'},
      {code: 5, name: 'date'},
      {code: 6, name: 'datetime'},
      {code: 7, name: 'time'}
    ];

    this.relationTypeList = [
      {code: 0, name: '一对一'},
      {code: 1, name: '一对多'},
      {code: 2, name: '多对多'}
    ];

    this.getList();
  }

  //获取所有的表
  getList(id?){
    this.http.get('element/dynamicTable/getAllTableList', '', data => {
      this.list = data || [];
      if(id){
        let item = this.list.filter(v => v.id == id)[0];
        if(item){
          this.clickTable(item);
        }
      }else{
        if(this.list.length){
          this.clickTable(this.list[0]);
        }
      }
    })
  }

  // 点击切换表文件
  activeTable:any; //当前展示的table
  clickTable(item){
    if(!item.columns){
      item.columns = [];
    }
    this.activeTable = item;
    //获取目标表列表以及对应的字段
    this.targetTables = this.list.filter(v => item.id !== v.id && v.columns && v.columns.length);
    this.cancelEdit();
  }

  //点击切换tab页,取消正在添加/编辑的状态
  cancelEdit(){
    this.columnAddFlag = false; 
    this.relationAddFlag = false; 
    this.permitAddFlag = false; 
    this.list.forEach(v => {
      if(v.columns && v.columns.length){
        v.columns.forEach(x => x.edit = false);
      }
      if(v.keys && v.keys.length){
        v.keys.forEach(x => x.edit = false);
      }
      if(v.projectAccessVos && v.projectAccessVos.length){
        v.projectAccessVos.forEach(x => x.edit = false);
      }
    })
  }

  //获取目标字段
  getTargetColumns(table){
    this.targetColumns = table.columns || [];
    this.editRelation.target = undefined;
  }

  // 右键显示指定下拉菜单
  activeItem:any = {};//右键选中的table
  activeIndex:any = {};//右键选中的table对应的index
  contextMenu($event, template, item, i): void {
    this.dropdown = this.nzDropdownService.create($event, template);
    this.activeItem = item;
    this.activeIndex = i;
  }

  // 新建或编辑表
  newTableModal = false;
  newTableForm: FormGroup;
  newTableFormSubmitted = false;
  tableModalTitle = '新建表';
  //打开 新建/编辑 表的弹框
  newTable(isEdit?){
    if(this.dropdown){
      this.dropdown.close();
    }
    this.newTableModal = true;
    this.newTableFormSubmitted = false;
    if(isEdit){
      this.tableModalTitle = '编辑表';
      if(this.activeItem.name){
        this.tableModalTitle += `（${this.activeItem.name}）`;
      }
      this.newTableForm = this.fb.group({
        status: [ this.activeItem.status == 1 ? true : false, [ Validators.required ] ],
        fullname: [ this.activeItem.fullname, [ Validators.required ] ],
        description: [ this.activeItem.description, [ Validators.required ] ]
      });
    }else{
      this.tableModalTitle = '新建表';
      this.newTableForm = this.fb.group({
        name: [ '', [ Validators.required ] ],
        fullname: [ '', [ Validators.required ] ],
        description: [ '', [ Validators.required ] ]
      }); 
    }
  }
  // 新建/编辑 表确定
  newTableOk(){
    this.newTableFormSubmitted = true;
    if(this.newTableForm.invalid){
      this.message.create('info', '请按提示填写数据！');
      return;
    }
    if(this.tableModalTitle == '新建表'){
      let nameRepeatArr = this.list.filter(v => this.newTableForm.value.name == v.name);
      if(nameRepeatArr.length){
        this.message.create('warning', '英文表名不能重复！');
        return;
      }
      this.http.post('element/dynamicTable/create', this.newTableForm.value, data => {
        this.getList(data);
        this.message.create('success', '新建成功！');
        this.newTableModal = false;
      })
    }else{
      let nameRepeatArr = this.list.filter(v => {
        if(this.newTableForm.value.name == v.name && v.name != this.activeItem.name){
          return true;
        }
      });
      if(nameRepeatArr.length){
        this.message.create('warning', '英文表名不能重复！');
        return;
      }
      let params = {
        id: this.activeItem.id,
        name: this.activeItem.name,
        fullname: this.newTableForm.value.fullname,
        description: this.newTableForm.value.description,
        status: this.newTableForm.value.status ? 1 : 0
      }
      this.http.post('element/dynamicTable/update', params, data => {
        this.activeItem.fullname = params.fullname;
        this.activeItem.description = params.description;
        this.activeItem.status = params.status;
        this.message.create('success', '编辑成功！');
        this.newTableModal = false;
      })
    }
  }

  //删除表
  tableDel(){
    this.dropdown.close();
    this.modalService.confirm({
      nzTitle: `确定删除表 "${this.activeItem.name}" ？`,
      nzOnOk: () => {
        this.http.del(`element/dynamicTable/delete/${this.activeItem.name}`, '', data => {
          this.list.splice(this.activeIndex, 1);
          if(this.activeTable && this.activeItem.name == this.activeTable.name){
            this.activeTable = {};
          }
        });
      }
    });
  }

  //字段类型
  columnTypeObj = {
    int: 1,
    long: 2,
    string: 3,
    boolean: 4,
    date: 5,
    datetime: 6,
    time: 7
  }
  //添加/编辑 字段
  columnAddFlag = false;//是否正在添加新字段
  editColumn:any = {
    type: 1,
    allowQuery: false,
    addEs: false,
    ispk: false
  };//正在编辑的字段
  columnEdit(item?){
    if(item){
      this.editColumn = item;
      this.columnAddFlag = false;
      this.activeTable.columns.forEach(v => {
        v.edit = false;
      });
      item.edit = true;
    }else{
      this.activeTable.columns.forEach(v => {
        v.edit = false;
      });
      this.editColumn = {
        type: 1,
        allowQuery: false,
        addEs: false,
        ispk: false
      }
      this.columnAddFlag = true;
    }
  }
  //添加/编辑 字段确认
  columnEditOk(item?){
    this.editColumn.colname ? this.editColumn.colname = this.editColumn.colname.trim() : false;
    if(!this.editColumn.colname || !this.editColumn.colname.trim()){
      this.message.create('warning', '请填写字段名称！');
      return;
    }else if(this.editColumn.colname.length > 20){
      this.message.create('error', '字段名称的长度不能超过20字符！');
      return;
    }else if(!this.editColumn.description || !this.editColumn.description.trim()){
      this.message.create('error', '请填写字段描述！');
      return;
    }else if(this.editColumn.type != 4){
      if(!this.editColumn.limit && this.editColumn.limit !== 0){
        this.message.create('warning', '请填写长度限制！');
        return;
      }
      if(!/^[1-9][0-9]{0,8}$/.test(this.editColumn.limit)){
        this.message.create('error', '字段长度请填写9位数以内的正整数！');
        return;
      }
    }
    if(this.editColumn.type != 4){
      if(!this.editColumn.defaultValue){
        this.editColumn.defaultValue = null;
      }else{
        this.editColumn.defaultValue = this.editColumn.defaultValue.trim();
        if((this.editColumn.type == 1 || this.editColumn.type == 2) && !/^-?[1-9][0-9]{0,8}$/.test(this.editColumn.defaultValue)){
          this.message.create('error', 'int类型默认值：-999999999~999999999');
          return;
        }else if(this.editColumn.type == 3 && this.editColumn.defaultValue.length >20){
          this.message.create('error', 'string类型默认值：20字符以内');
          return;
        }else if(this.editColumn.type == 5 && /^[0-9]{4}-([0][1-9]|[1][12])-([0][1-9]|[12][0-9]|[3][01])$/.test(this.editColumn.defaultValue)){
          this.message.create('error', 'date类型的默认值：yyyy-MM-dd');
          return;
        }else if(this.editColumn.type == 6 && /^([01][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9]$/.test(this.editColumn.defaultValue)){
          this.message.create('error', 'time类型的默认值：HH:mm:ss');
          return;
        }else if(this.editColumn.type == 7 && /^[0-9]{4}-([0][1-9]|[1][12])-([0][1-9]|[12][0-9]|[3][01])\s([01][0-9]|[2][0-3]):[0-5][0-9]:[0-5][0-9]$/.test(this.editColumn.defaultValue)){
          this.message.create('error', 'timestamp类型的默认值：yyyy-MM-dd HH:mm:ss');
          return;
        }
      }
    }
    
    if(!item){
      let repeatNameArr = this.activeTable.columns.filter(v => this.editColumn.colname == v.colname);
      if(repeatNameArr.length){
        this.message.create('warning', '当前表已存在该字段名称，请勿重复添加！');
        return;
      }      
    }
    let params:any = {
      tableId: this.activeTable.id,
      addEs: this.editColumn.addEs ? 1 : 0,
      allowQuery: this.editColumn.allowQuery ? 1 : 0,
      colname: this.editColumn.colname,
      defaultValue: this.editColumn.defaultValue, 
      ispk: this.editColumn.ispk ? 1 : 0,
      limit: +this.editColumn.limit,
      type: this.editColumn.type,
      description: this.editColumn.description
    }
    if(item){
      params.id = item.id;
      this.http.post('element/dynamicColumn/updateColumn', params, data => {
        item.colname = this.editColumn.colname;
        item.description = this.editColumn.description;
        item.defaultValue = this.editColumn.defaultValue;
        item.type = this.editColumn.type;
        item.limit = this.editColumn.limit;
        item.allowQuery = this.editColumn.allowQuery ? 1 : 0;
        item.addEs = this.editColumn.addEs ? 1 : 0;
        item.ispk = this.editColumn.ispk ? 1 : 0;
        this.message.create('success', '编辑成功！');
        item.edit = false;
      })
    }else{
      this.http.post('element/dynamicColumn/createColumn', params, data => {
        let newItem = {...params};
        newItem.id = data;
        this.activeTable.columns = [ ...this.activeTable.columns, newItem];
        this.message.create('success', '添加成功！');
        this.columnAddFlag = false;
      })
    }
  }
  defaultValueTip = 'null';//默认值的表单提示
  //改变字段类型
  changeType(currentValue){
    if(currentValue == 4){
      this.editColumn.defaultValue = 'false';
      this.defaultValueTip = '';
    }else if(currentValue == 5){
      this.editColumn.defaultValue = '';
      this.defaultValueTip = 'yyyy-MM-dd';
    }else if(currentValue == 6){
      this.editColumn.defaultValue = '';
      this.defaultValueTip = 'HH:mm:ss';  
    }else if(currentValue == 7){
      this.editColumn.defaultValue = '';
      this.defaultValueTip = 'yyyy-MM-dd HH:mm:ss';
    }else{
      this.editColumn.defaultValue = '';
      this.defaultValueTip = 'null';
    }
  }

  //删除字段
  columnDel(item){
    this.http.del(`element/dynamicColumn/deleteColumn/${item.id}`, '', data => {
      this.message.create('success', '删除成功！');
    })
    this.activeTable.columns = this.activeTable.columns.filter(v => v.colname != item.colname);
  }

  //添加/编辑 关系字段
  relationAddFlag = false;//是否正在添加新关系字段
  editRelation:any = {
    type: 0
  };//正在编辑的关系字段
  relationEdit(item?){
    if(item){
      this.editRelation = item;
      this.editRelation.source = {
        id: this.editRelation.sourceColumnId,
        colname: this.editRelation.sourceColumnName
      }
      this.editRelation.targetTable = {
        id: this.editRelation.targetTableId,
        name: this.editRelation.targetTableName
      }
      let targetTableDetail = this.targetTables.filter(v => v.id == this.editRelation.targetTableId)[0];
      this.targetColumns = targetTableDetail ? (targetTableDetail.columns || []) : [];
      this.editRelation.target = {
        id: this.editRelation.targetColumnId,
        colname: this.editRelation.targetColumnName
      }
      this.relationAddFlag = false;
      this.activeTable.keys.forEach(v => {
        v.edit = false;
      });
      item.edit = true;
    }else{
      this.activeTable.keys.forEach(v => {
        v.edit = false;
      });
      this.editRelation = {
        type: 0
      }
      this.relationAddFlag = true;
    }
  }
  //添加/编辑 关系字段确认
  relationEditOk(item?){
    if(!this.editRelation.source || !this.editRelation.target || !this.editRelation.targetTable){
      this.message.create('warning', '请选择必要的数据！');
      return;
    }
    let params:any = {
      sourceTableId: this.activeTable.id,
      sourceTableName: this.activeTable.name,
      sourceColumnId: this.editRelation.source.id,
      sourceColumnName: this.editRelation.source.colname,
      targetTableId: this.editRelation.targetTable.id,
      targetTableName: this.editRelation.targetTable.name,
      targetColumnId: this.editRelation.target.id,
      targetColumnName: this.editRelation.target.colname,
      type: this.editRelation.type
    }
    if(item){
      params.id = item.id;
      this.http.post('element/dynamicKey/update', params, data => {
        item.sourceColumnId = this.editRelation.source.id;
        item.sourceColumnName = this.editRelation.source.colname;
        item.targetTableId = this.editRelation.targetTable.id;
        item.targetTableName = this.editRelation.targetTable.name;
        item.targetColumnId = this.editRelation.target.id;
        item.targetColumnName = this.editRelation.target.colname;
        item.type = this.editRelation.type;
        this.message.create('success', '编辑成功！');
        item.edit = false;
      })
    }else{
      this.http.post('element/dynamicKey/create', params, data => {
        let newItem:any = {...params};
        newItem.id = data;
        this.activeTable.keys = [ ...this.activeTable.keys, newItem];
        this.message.create('success', '添加成功！');
        this.relationAddFlag = false;        
      })
    }
  }
  //select绑定对象时根据id来对比从而设置默认项的函数
  compareFn(o1: any, o2: any){
    return o1 && o2 ? o1.id === o2.id : o1 === o2
  }

  //删除关系字段
  relationDel(item){
    this.http.del(`element/dynamicKey/delete/${item.id}`, '', data => {
      this.activeTable.keys = this.activeTable.keys.filter(v => v.id != item.id);
    })
  }

  //添加/编辑 权限字段
  permitAddFlag = false;//是否正在添加新权限字段
  editPermit:any = {
    type: 0
  };//正在编辑的权限字段
  getObjList:boolean = false;
  permitEdit(item?){
    if(!this.getObjList){
      let objParams:any = {
        page: 1,
        pageSize: 1000
      }
      this.http.get('element/projects', objParams, data => {
        this.getObjList = true;
        this.objList = (data && data.items && data.items.length) ? data.items : [];
      })
    }
    if(item){
      this.editPermit = {...item};
      this.activeTable.projectAccessVos.forEach(v => {
        v.edit = false;
      });
      this.permitAddFlag = false;
      item.edit = true;
    }else{
      this.activeTable.projectAccessVos.forEach(v => {
        v.edit = false;
      });
      this.editPermit = {
        type: 0
      }
      this.permitAddFlag = true;
    }
  }
  //添加/编辑 权限字段确认
  permitEditOk(item?){
    if(!this.editPermit.projectId && this.editPermit.projectId !== 0){
      this.message.create('warning', '请填写项目id！');
      return;
    }else if(this.editPermit.projectId <= 0){
      this.message.create('error', '请填写正确的项目id');
      return;
    }else if(!this.editPermit.read && !this.editPermit.write && !this.editPermit.schema){
      this.message.create('warning', '请至少添加一个权限！');
      return;
    }
    let addParams = {
      tableId: this.activeTable.id,
      projectId: this.editPermit.projectId,
      read: this.editPermit.read ? 1 : 0,
      schema: this.editPermit.schema ? 1: 0,
      write: this.editPermit.write ? 1 : 0
    }
    if(item){
      this.http.post('element/dynamicTableAccess/updateProjectAccess', addParams, data => {
        item.projectId = this.editPermit.projectId;
        item.read = this.editPermit.read;
        item.write = this.editPermit.write;
        item.schema = this.editPermit.schema;
        this.message.create('success', '编辑成功！');
        item.edit = false;
      })
    }else{
      let repeatArr = this.activeTable.projectAccessVos.filter(v => v.projectId == this.editPermit.projectId);
      if(repeatArr.length){
        this.message.create('warning', '当前表已设置了与该项目的权限信息，请直接编辑！');
        return;
      }
      this.http.post('element/dynamicTableAccess/create', addParams, data => {
        this.editPermit.createTime = data || null;
        this.activeTable.projectAccessVos = [ ...this.activeTable.projectAccessVos, this.editPermit];
        this.message.create('success', '添加成功！');
        this.permitAddFlag = false;
      })
    }
  }

  //删除权限字段
  permitDel(item){
    let params = {
      tableId: this.activeTable.id,
      projectId: item.projectId
    }
    this.http.post('element/dynamicTableAccess/delete', params, data => {
      this.activeTable.projectAccessVos = this.activeTable.projectAccessVos.filter(v => v.projectId != item.projectId);
      this.message.create('success', '删除成功！');
    })
  }

}
