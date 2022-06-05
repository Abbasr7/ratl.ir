import { Directive, HostListener, Input } from '@angular/core';
import * as $ from 'jquery'

@Directive({
  selector: '[appScrollTo]'
})
export class ScrollToDirective {

  @Input() appScrollTo:string
  @HostListener('click') scroll(){
    $('html,body').animate({ scrollTop: $("#" + this.appScrollTo).offset()?.top }, 'slow');
  }
  constructor() { }

}
