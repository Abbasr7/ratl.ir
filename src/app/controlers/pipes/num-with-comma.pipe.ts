import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numWithComma'
})
export class NumWithCommaPipe implements PipeTransform {

  transform(value: any, ...args: number[]): string {
    return value?this.numberWithCommas(value):'';
  }

  numberWithCommas (x:any) {
    let v = Math.round(x)
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
