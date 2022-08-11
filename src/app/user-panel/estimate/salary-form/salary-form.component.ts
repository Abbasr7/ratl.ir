import { Component, OnInit } from '@angular/core';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.css']
})
export class SalaryFormComponent extends EstimateComponent {

  test= 'salary form'
  refereshEstimate(){
    this.salaryFormEstimate();
  }
}
