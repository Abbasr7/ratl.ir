import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-working-capital',
  templateUrl: './working-capital.component.html',
  styleUrls: ['./working-capital.component.css']
})
export class WorkingCapitalComponent extends EstimateComponent implements AfterViewInit{
  
  ngAfterViewInit(): void {
    this.bime(this.estimated.workingCapital,this.year.workingCapital);
  }

  // هزینه های جاری
  applyChanges(){
    this.year.building = this.year.workingCapital;
    this.year.equipment = this.year.workingCapital;
    this.year.vehicles = this.year.workingCapital;
    this.year.salesAndAdsRate = this.year.workingCapital;


    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)

    this.maintenanceCost('any',true)
    this.getWorkingCapital()
    this.salesAndAdsRate()
    this.bime(this.estimated.workingCapital,this.year.workingCapital)
  }

}
