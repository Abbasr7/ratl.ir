import { Component, OnInit } from '@angular/core';
import { IRate } from 'src/app/controlers/interfaces/interfaces';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-depreciations',
  templateUrl: './depreciations.component.html',
  styleUrls: ['./depreciations.component.css']
})
export class DepreciationsComponent extends EstimateComponent implements OnInit {
  
  ngOnInit(): void {

    this.unit = this.projactService.projact.value

    if (this.unit_id && !this.unit._id) {
      this.getCurrentUnit();
    }
    
    this.projactService.getCahnges().subscribe(res => {
      this.estimated = res
    })
  }

  changeYear(event: Event, type: string) {
    if (type == 'preOperation') {
      this.depreciationOfPreOperation(this.year[type as keyof IRate]);
      return;
    }

    if (type == 'unforeseen') {
      this.depreciationOfUnforeseen(this.year[type as keyof IRate]);
      return
    }
  
    this.depreciationCalculate(type, this.year[type as keyof IRate]);
  }

  rateChanged(event: Event, type: any) {
    this.rate[type as keyof IRate] = (<HTMLInputElement>event.target).valueAsNumber
    this.depreciationCalculate(type, this.year[type as keyof IRate])
  }

  rateValue(type: any) {
    return this.rate[type as keyof IRate]
  }


}
