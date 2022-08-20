import { AfterViewInit, Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-working-capital',
  templateUrl: './working-capital.component.html',
  styleUrls: ['./working-capital.component.css']
})
export class WorkingCapitalComponent extends EstimateComponent implements OnInit{

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
  // هزینه های جاری
  applyChanges(year?:number){
    year? this.year.workingCapital = year: '';
    this.year.building = this.year.workingCapital;
    this.year.equipment = this.year.workingCapital;
    this.year.vehicles = this.year.workingCapital;
    this.year.salesAndAdsRate = this.year.workingCapital;


    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)

    this.maintenanceCost('any',true)
    this.workingCapital()
    this.salesAndAdsRate()
    this.bime(this.estimated.workingCapital,this.year.workingCapital);
    
    this.projactService.setChanges.next(this.estimated);
  }
  
  setChanges(){
    this.salesAndAdsRate();
    this.projactService.setChanges.next(this.estimated);
  }

}
