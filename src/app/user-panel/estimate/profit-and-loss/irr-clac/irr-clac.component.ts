import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEstimate } from 'src/app/controlers/interfaces/interfaces';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { ProfitAndLossComponent } from '../profit-and-loss.component';
import { irr, npv } from 'financial'
import { Subscription } from 'rxjs';
import { MessagesService } from 'src/app/controlers/services/messages.service';

@Component({
  selector: 'app-irr-clac',
  template: '',
  styles: ['']
})
export class IRRClacComponent extends ProfitAndLossComponent implements OnDestroy,AfterViewInit {

  @Input('profitAndLoss') set profitAndLoss1(value:any) {
    setTimeout(() => {
      this.profitAndLoss = value;
    }, 0);
  }

  constructor(public route2: ActivatedRoute,
              public projactService2: ProjactsService,
              public server2: ServerService,
              private msgService2: MessagesService) 
  {
    super(route2,projactService2,server2,msgService2);
    this.getBasePrice();
  }

  ngAfterViewInit(): void {
    this.irrSubs$ = this.projactService2.callGetIRR.asObservable().subscribe(res => {
      if (res == true) {
        this.getIRR();
      }
    });
    this.npvSubs$ = this.projactService2.callGetNPV.asObservable().subscribe(res => {
      if (typeof res == 'number') {
        this.getNPV(res);
      }
    });
  }

  @Output() IRR_Value = new EventEmitter();
  @Output() getNPV_Value = new EventEmitter();
  allEstimates: IEstimate[] = [];
  allProfitAndLosses:any = [];
  plan_values: number[];

  get allYears() {
    return this.stringYear.length;
  };

  override ngOnDestroy() {
    this.irrSubs$.unsubscribe();
    this.npvSubs$.unsubscribe();
  }

  getIRR() {
    let plan_vals:number[] = []
    let shareholder_vals:number[] = []
    const CP_YEAR = {...this.year};

    // افزودن مبلغ جمع سرمايه مورد نياز به این لیست
    plan_vals.push(-this.estimated.financialSummary.totalCapitalRequired);
    shareholder_vals.push(-(this.estimated.financialSummary.totalCapitalRequired - this.estimated.bankFacilities.bankLoan));

    for (let year = 1; year <= this.allYears; year++) {
      Object.keys(this.year).map(key => this.year[key] = year);
      this.estimateAllYears(year);

      this.allEstimates.push(this.estimated);
      this.allProfitAndLosses.push(this.profitAndLoss);

      let a=0,b=0;
      if (year == this.allYears) {
        // ارزش در پایان سال دهم (ارزش اسقاط)
        a = this.estimated.equipment[this.estimated.equipment.length-1].arzeshDaftari
                + this.estimated.vehicles[this.estimated.vehicles.length-1].arzeshDaftari
                + this.estimated.officeEquipment[this.estimated.officeEquipment.length-1].arzeshDaftari
                + this.estimated.preOperation[this.estimated.preOperation.length-1].arzeshDaftari;
        // مجموع هزینه سرمایه در گردش در سال آخر
        b = this.estimated.workingCapital.sumInPeriod;
      }
      plan_vals.push(this.profitAndLoss.efficiency[0].finalCost()+a+b);
      shareholder_vals.push(this.profitAndLoss.profitLoss[13].finalCost()+a+b);
    }

    this.plan_values = plan_vals;
    this.year = CP_YEAR;

    this.estimateAllYears(CP_YEAR.profitLoss);
  
    let values = {
      planIRR: this.IRR(plan_vals),
      shareholdeIRR: this.IRR(shareholder_vals),
    }

    this.IRR_Value.emit(values);
  }

  getNPV(percent:number) {
    let NPV = npv(percent/100,this.plan_values);
    this.getNPV_Value.emit(NPV);
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
    this.allComputes()
  }

  IRR(values:number[], guess?:number) {
    // Credits: algorithm inspired by Apache OpenOffice
    
    // Calculates the resulting amount
    var irrResult = function(values:number[], dates:number[], rate:number) {
      var r = rate + 1;
      var result = values[0];
      for (var i = 1; i < values.length; i++) {
        result += values[i] / Math.pow(r, (dates[i] - dates[0]) / 365);
      }
      return result;
    }
  
    // Calculates the first derivation
    var irrResultDeriv = function(values:number[], dates:number[], rate:number) {
      var r = rate + 1;
      var result = 0;
      for (var i = 1; i < values.length; i++) {
        var frac = (dates[i] - dates[0]) / 365;
        result -= frac * values[i] / Math.pow(r, frac + 1);
      }
      return result;
    }
  
    // Initialize dates and check that values contains at least one positive value and one negative value
    var dates:number[] = [];
    var positive = false;
    var negative = false;
    for (var i = 0; i < values.length; i++) {
      dates[i] = (i === 0) ? 0 : dates[i - 1] + 365;
      if (values[i] > 0) positive = true;
      if (values[i] < 0) negative = true;
    }
    
    // Return error if values does not contain at least one positive value and one negative value
    if (!positive || !negative) return '#NUM!';
  
    // Initialize guess and resultRate
    guess = (typeof guess === 'undefined') ? 0.1 : guess;
    var resultRate = guess;

    // Set maximum epsilon for end of iteration
    var epsMax = 1e-10;
    
    // Set maximum number of iterations
    var iterMax = 50;
  
    // Implement Newton's method
    var newRate, epsRate, resultValue;
    var iteration = 0;
    var contLoop = true;
    do {
      resultValue = irrResult(values, dates, resultRate);
      newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
      epsRate = Math.abs(newRate - resultRate);
      resultRate = newRate;
      contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
    } while(contLoop && (++iteration < iterMax));
  
    if(contLoop) return '#NUM!';
  
    // Return internal rate of return
    return resultRate*100;
  }

}
