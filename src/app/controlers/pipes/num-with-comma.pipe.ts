import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numWithComma'
})
export class NumWithCommaPipe implements PipeTransform {

  transform(value: number, ...args: number[]): string {
    return this.numberWithCommas(value);

  }

  numberWithCommas (x:number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

}
