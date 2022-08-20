import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numWithComma'
})
export class NumWithCommaPipe implements PipeTransform {

  transform(value: any, scale: string = ''): string {
    return value?this.numberWithCommas(value) + ` ${scale}`: '0';
  }

  numberWithCommas (x:any) {
    let minus = x < 0? '-':'';
    let v = this.justNum(x)
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + minus;
  }

  justNum(x: any) {
    let xx;
    if (typeof x == 'number') {
      xx = Math.round(x).toString()
    } else {
      xx = x.toString()
    }
    return +xx.replace(/\D/g, "")
  }

}
