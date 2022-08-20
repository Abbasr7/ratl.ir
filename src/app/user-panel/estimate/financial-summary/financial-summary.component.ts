import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-financial-summary',
  templateUrl: './financial-summary.component.html',
  styleUrls: ['./financial-summary.component.css']
})
export class FinancialSummaryComponent extends EstimateComponent implements OnInit {

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

}
