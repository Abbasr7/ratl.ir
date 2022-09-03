import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-bank-facilities',
  templateUrl: './bank-facilities.component.html',
  styleUrls: ['./bank-facilities.component.css']
})
export class BankFacilitiesComponent extends EstimateComponent implements OnInit {

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
      this.period = this.toNum(this.unit.fundAndExpensesForm.time);
    });
  }

  applyChanges() {
    this.bankFacilities();
    this.projactService.setChanges.next(this.estimated);
  }
}
