import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numWithComma'
})
export class NumWithCommaPipe implements PipeTransform {

  type:string;
  transform(value: any, unit: string = '',numType:string = 'int'): string {
    this.type = numType;
    return value?this.numberWithCommas(value) + ` ${unit}`: '0';
  }

  numberWithCommas (x:any) {
    let minus = x < 0? '-':'';
    let v = this.justNum(x)
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + minus;
  }

  justNum(x: any) {
    let xx;
    if (typeof x == 'number' && this.type == 'int') {
      xx = Math.round(x).toString()
    } else if (typeof x == 'number' && this.type == 'float') {
      let v = Math.round(x*1000)/1000;
      return x<0? v*-1: v;
    } else {
      xx = x.toString()
    }
    return +xx.replace(/\D/g, "")
  }

}
