import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewUnitComponent } from 'src/app/user-panel/new-unit/new-unit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NumWithCommaDirective } from 'src/app/controlers/directives/num-with-comma.directive';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NumWithCommaPipe } from 'src/app/controlers/pipes/num-with-comma.pipe';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    NewUnitComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatTooltipModule,
    SharedModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class UserProjactsModule { }
