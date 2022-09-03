import { AfterViewInit, Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-annual-production-costs',
  templateUrl: './annual-production-costs.component.html',
  styleUrls: ['./annual-production-costs.component.css']
})
export class AnnualProductionCostsComponent extends EstimateComponent implements OnInit{
  
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
    this.percents.ghalebMasrafi = 20;
  }

  applyChanges() {
    
    this.year.building = this.year.annualPC;
    this.year.equipment = this.year.annualPC;
    this.year.vehicles = this.year.annualPC;
    this.year.officeEquipment = this.year.annualPC
    this.year.salesAndAdsRate = this.year.annualPC;
    this.year.workingCapital = this.year.annualPC;
    
    
    this.depreciationCalculate('equipment', this.year.equipment);
    this.depreciationCalculate('building', this.year.building);
    this.depreciationCalculate('vehicles', this.year.vehicles);
    this.depreciationCalculate('officeEquipment', this.year.officeEquipment);
    
    this.maintenanceCost('any',true);
    this.workingCapital();
    this.salesAndAdsRate();
    this.annualProductionCosts();    
  }

}
