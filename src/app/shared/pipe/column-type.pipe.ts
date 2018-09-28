import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnType'
})
export class ColumnTypePipe implements PipeTransform {

  transform(value: any, args?: any): any {
  	let list = {
  		1: 'int',
  		2: 'long',
  		3: 'string',
  		4: 'boolean',
  		5: 'date',
  		6: 'datetime',
  		7: 'time'
  	}
    return list[value];
  }

}