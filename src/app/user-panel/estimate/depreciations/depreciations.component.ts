import { Component, OnInit } from '@angular/core';
import { IRate } from 'src/app/controlers/interfaces/interfaces';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-depreciations',
  templateUrl: './depreciations.component.html',
  styleUrls: ['./depreciations.component.css']
})
export class DepreciationsComponent extends EstimateComponent {


  changeYear(event: Event, type: string) {
    this.depreciationCalculate(type, this.year[type as keyof IRate])
  }

  rateChanged(event: Event, type: any) {
    this.rate[type as keyof IRate] = (<HTMLInputElement>event.target).valueAsNumber
    this.depreciationCalculate(type, this.year[type as keyof IRate])
  }

  rateValue(type: any) {
    return this.rate[type as keyof IRate]
  }


}
