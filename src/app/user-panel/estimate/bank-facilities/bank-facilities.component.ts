import { Component, OnInit } from '@angular/core';
import { EstimateComponent } from '../estimate.component';

@Component({
  selector: 'app-bank-facilities',
  templateUrl: './bank-facilities.component.html',
  styleUrls: ['./bank-facilities.component.css']
})
export class BankFacilitiesComponent extends EstimateComponent {


  getSumOfArrays(array:number[],toAndis:number){
    let sum = 0;
    let from = toAndis - 12;
    for (let i = from; i < toAndis; i++) {
      sum += array[i];
    }
    return sum
  }
}
