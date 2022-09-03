import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEstimate } from 'src/app/controlers/interfaces/interfaces';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { ProfitAndLossComponent } from '../profit-and-loss.component';

@Component({
  selector: 'app-irr-clac',
  template: '',
  styles: ['']
})
export class IRRClacComponent extends ProfitAndLossComponent implements AfterViewInit {
  
  constructor(public route2: ActivatedRoute,
    public projactService2: ProjactsService,
    public server2: ServerService) {
    super(route2,projactService2,server2)
    this.getBasePrice()
  }
  ngAfterViewInit(): void {
    this.callGetIRRFunc.asObservable().subscribe(res => {
      if (res == true) {
        this.getIRR();
      }
    })
  }

  @Output() IRR_Value = new EventEmitter();
  allEstimates: IEstimate[] = [];
  allProfitAndLosses:any = [];

  get allYears() {
    return this.stringYear.length;
  };

  getIRR() {
    let plan_vals:number[] = []
    let shareholder_vals:number[] = []
    for (let year = 1; year < this.allYears; year++) {
      Object.keys(this.year).map(key => this.year[key] = year)
      this.estimateAllYears(year);
      this.allEstimates.push(this.estimated);
      this.allProfitAndLosses.push(this.profitAndLoss);
      plan_vals.push(this.profitAndLoss.efficiency[0])
      shareholder_vals.push(this.profitAndLoss.profitLoss[13])
    }

    let values = {
      shareholdeIRR: this.IRR_Calc(shareholder_vals),
      planIRR: this.IRR_Calc(plan_vals)
    }


    this.IRR_Value.emit(values);
  }

  estimateAllYears(year:number) {
    this.depreciationCalculate('equipment', year);
    this.depreciationCalculate('building', year);
    this.depreciationCalculate('vehicles', year);
    this.depreciationCalculate('officeEquipment', year);
    this.maintenanceCost('any',true);

    this.salaryFormEstimate();

    this.workingCapital();
    this.salesAndAdsRate();
    if (year == 1) {
      this.financialSummary();
    }
    
    this.bime(this.estimated.workingCapital,this.year.workingCapital);

    this.bankFacilities();

    this.annualProductionCosts();

    // Profit and Loss
    this.forecastingVarCosts();
    this.forecastingFixCosts();
    this.incomesCompute();
    this.profitLossCompute();
  }

  IRR_Calc (values:number[]) {
    let min = 0.0;
    let max = 1.0;
    do {
      var guest = (min + max) / 2;
      var NPV = 0;
      for (var j=0; j<values.length; j++) {
            NPV += values[j]/Math.pow((1+guest),j);
      }
      if (NPV > 0) {
        min = guest;
      }
      else {
        max = guest;
      }
    } while(Math.abs(NPV) > 0.000001);
    return guest * 100;
  }

}
