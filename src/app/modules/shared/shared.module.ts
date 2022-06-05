import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumWithCommaPipe } from 'src/app/controlers/pipes/num-with-comma.pipe';
import { NumWithCommaDirective } from 'src/app/controlers/directives/num-with-comma.directive';
import { ModalComponent } from 'src/app/home/modal/modal.component';
import { ShowPlansComponent } from 'src/app/home/plans/show-plans.component';



@NgModule({
  declarations: [
    NumWithCommaPipe,
    NumWithCommaDirective,
    ModalComponent,
    ShowPlansComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule,
    NumWithCommaDirective,
    NumWithCommaPipe,
    ModalComponent,
    ShowPlansComponent
  ]
})
export class SharedModule { }
