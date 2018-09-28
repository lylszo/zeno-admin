import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relationType'
})
export class RelationTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let list = {
  		0: '一对一',
  		1: '一对多',
  		2: '多对多'
  	}
    return list[value];
  }

}
