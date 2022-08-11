import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-annual-production-costs',
  templateUrl: './annual-production-costs.component.html',
  styleUrls: ['./annual-production-costs.component.css']
})
export class AnnualProductionCostsComponent extends EstimateComponent implements AfterViewInit{
  
  ngAfterViewInit(): void {
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
    this.getWorkingCapital();
    this.salesAndAdsRate();
    this.annualProductionCosts();    
  }

}
