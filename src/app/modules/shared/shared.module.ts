import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumWithCommaPipe } from 'src/app/controlers/pipes/num-with-comma.pipe';
import { NumWithCommaDirective } from 'src/app/controlers/directives/num-with-comma.directive';
import { ModalComponent } from 'src/app/home/modal/modal.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    NumWithCommaPipe,
    NumWithCommaDirective,
    ModalComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    MatTooltipModule,
    MatTabsModule
  ],
  exports: [
    CommonModule,
    NumWithCommaDirective,
    NumWithCommaPipe,
    ModalComponent,
    MatTooltipModule,
    AppRoutingModule,
    MatTabsModule
  ]
})
export class SharedModule { }
