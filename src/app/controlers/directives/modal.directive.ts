import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appModal]'
})
export class ModalDirective implements OnInit {

  constructor(private templateRef:TemplateRef<any>,
    private vcRef:ViewContainerRef) { }

  @Input() modal:any

  ngOnInit(): void {
    
  }

}
