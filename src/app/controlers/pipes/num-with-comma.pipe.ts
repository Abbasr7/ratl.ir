import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numWithComma'
})
export class NumWithCommaPipe implements PipeTransform {

  transform(value: any, scale: string = ''): string {
    return value?this.numberWithCommas(value) + ` ${scale}`:'';
  }

  numberWithCommas (x:any) {
    let v = Math.round(x)
    return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
