import { Component, OnDestroy, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-salary-form',
  templateUrl: './salary-form.component.html',
  styleUrls: ['./salary-form.component.css']
})
export class SalaryFormComponent extends EstimateComponent implements OnInit {

  ngOnInit(): void {
    this.projactService.getCahnges().pipe(
      take(1)
    ).subscribe(res => {
      this.estimated = res;
    });
    this.projactService.getUnit().pipe(
      take(2)
    ).subscribe(res => {
      this.unit = res;
    });
  }

  test= 'salary form'
  refereshEstimate(){
    this.salaryFormEstimate();
  }
}
