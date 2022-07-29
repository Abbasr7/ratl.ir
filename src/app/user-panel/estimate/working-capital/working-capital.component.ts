import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-working-capital',
  templateUrl: './working-capital.component.html',
  styleUrls: ['./working-capital.component.css']
})
export class WorkingCapitalComponent extends EstimateComponent implements OnInit,AfterViewInit{
  
  ngAfterViewInit(): void {
  }
  override ngOnInit(): void {
    this.bime()
    
  }
  // هزینه های جاری
  applyChanges(){
    this.year.building = this.year.workingCapital;
    this.year.equipment = this.year.workingCapital;
    this.year.vehicles = this.year.workingCapital;
    // this.year.officeEquipment = this.year.workingCapital;
    // this.year.preOperation = this.year.workingCapital;
    this.year.salesAndAdsRate = this.year.workingCapital;
    // this.year.bankFacilities = this.year.workingCapital;

    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)
    // this.depreciationCalculate('officeEquipment', this.year.officeEquipment);
    this.maintenanceCost('any',true)

    // this.salaryFormEstimate()

    this.getWorkingCapital()
    this.bime()

    // this.financialSummary()

    // this.bankFacilities()
  }

  bime() {
    let firstYearBime = this.estimated.financialSummary.sum * 0.002

    const calculate = (bime:number,year:number) => {
      let v = bime * 1.1;
      if (year <=2 ) {
        this.estimated.workingCapital.bime = v;
        return;
      } else {
        calculate(v,year-1);
      }
    }

    if (this.year.workingCapital == 1) {
      this.estimated.workingCapital.bime = firstYearBime;
    } else {
      calculate(firstYearBime,this.year.workingCapital);
    }
  }


}
