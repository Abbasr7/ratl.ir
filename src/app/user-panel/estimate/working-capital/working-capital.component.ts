import { AfterViewInit, Component, OnInit } from '@angular/core';
import { lastValueFrom, take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-working-capital',
  templateUrl: './working-capital.component.html',
  styleUrls: ['./working-capital.component.css']
})
export class WorkingCapitalComponent extends EstimateComponent implements OnInit{

  basePrice2: number;

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
    this.getBasePrice();
    
  }
  // هزینه های جاری
  applyChanges(){
    this.basePrice = this.toNum(this.basePrice)
    this.setBasePrice(this.basePrice);
    
    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)

    this.maintenanceCost('any',true)
    this.workingCapital()
    this.salesAndAdsRate()
    this.bime(this.estimated.workingCapital,this.year.workingCapital);

    this.saveParamsChanges();
  }

  changeYear() {
    this.year.building = this.year.workingCapital;
    this.year.equipment = this.year.workingCapital;
    this.year.vehicles = this.year.workingCapital;
    this.year.salesAndAdsRate = this.year.workingCapital;
    this.year.profitLoss = this.year.workingCapital;
    this.applyChanges();
  }

  setChanges(){
    this.projactService.basePrice.next(this.basePrice)
    this.projactService.setChanges.next(this.estimated);
    this.applyChanges();
  }

}
