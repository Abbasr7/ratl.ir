import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-annual-production-costs',
  templateUrl: './annual-production-costs.component.html',
  styleUrls: ['./annual-production-costs.component.css']
})
export class AnnualProductionCostsComponent extends EstimateComponent implements OnInit,OnDestroy{
  
  sub$1:Subscription;
  ngOnInit(): void {
    // this.percents.ghalebMasrafi = 20;

    this.sub$1 = this.projactService.getCahnges().subscribe(res => {
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
  
    this.depreciationCalculate('equipment', this.year.equipment);
    this.depreciationCalculate('building', this.year.building);
    this.depreciationCalculate('vehicles', this.year.vehicles);
    this.depreciationCalculate('officeEquipment', this.year.officeEquipment);
    
    this.maintenanceCost('any',true);
    this.workingCapital();
    this.salesAndAdsRate();
    this.annualProductionCosts();

    this.projactService.setChanges.next(this.estimated);
  }

  changeYear() {
    let year = this.toNum(this.year.annualPC)
    this.year.building = year;
    this.year.equipment = year;
    this.year.vehicles = year;
    this.year.officeEquipment = year
    this.year.salesAndAdsRate = year;
    this.year.workingCapital = year;
    
    this.applyChanges();
  }

  ngOnDestroy() {
    this.sub$1.unsubscribe();
  }

}
