import { Directive, HostBinding, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appNumWithComma]'
})
export class NumWithCommaDirective implements OnInit {

  constructor() { }

  @Input('appNumWithComma') defaultValue: string|number;
  @HostBinding('value') inputValue: string | number = '';

  ngOnInit(){
    this.defaultValue?this.inputValue = this.defaultValue : ''
  }

  @HostListener('input', ['$event']) public onKeyup($event: Event) {
    let val = (<HTMLInputElement>$event.target).value
    this.inputValue = this.numberWithCommas(val)
  }
  @HostListener("focus", ["$event"]) onFocus($event: Event) {
    let val = (<HTMLInputElement>$event.target).value
    this.inputValue = this.numberWithCommas(val)
  }
@HostListener("blur", ["$event"]) onBlur($event: Event) {
  let val = (<HTMLInputElement>$event.target).value
  this.inputValue = this.justNum(val)
}

numberWithCommas(x: any) {
  let val = this.persianNumToEng(x)
  return val.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

justNum(x: any) {
  let xx = x.toString()
  return +xx.replace(/\D/g, "")
}

persianNumToEng(str: any) {
  let persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  if (typeof str === 'string') {
    for (let i = 0; i < persianNumbers.length; i++) {
      str = str.replace(persianNumbers[i], i);
    }
  }
  return str
}
}