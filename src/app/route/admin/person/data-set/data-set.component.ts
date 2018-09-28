import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../../shared/service/http.service';

@Component({
  selector: 'app-data-set',
  templateUrl: './data-set.component.html',
  styleUrls: ['./data-set.component.scss']
})
export class DataSetComponent implements OnInit {

  constructor(private fb: FormBuilder, private http: HttpService) { }

  // 数据初始化
  dataForm: FormGroup;
  name;

  ngOnInit() {
  	this.dataForm = this.fb.group({
        name: [ '', [ Validators.required ] ],
        mobile: [ '', [ Validators.required ] ]
  	}); 
    this.http.get('user/0', '', data => {
      this.name = data.name;
    })
  }

}
