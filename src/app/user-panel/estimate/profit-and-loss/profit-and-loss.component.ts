import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { EstimateComponent } from '../estimate.component';
import { IRRClacComponent } from './irr-clac/irr-clac.component';

export class Iforecast {
  id: number;

  // عنوان
  title: string;

  // تعیین درصد
  percent: any= '#null';

  // هزینه
  cost: number;

  // توضیحات
  description: string;

  /**
   * برای تعیین نوع عدد: صحیح-اعشاری-رشته
   * - null == 'int' عددصحیح
   * - 'string' : برای مواقعی که میخواهیم رشته بدون تغییر چاپ شود
   * - 'float': اعشاری
   */
  type: string;

  /**
   * برای هایلایت ردیف ایتم مورد نظر بکار میرود.
   */
  highLight = false;

  // برای تعیین عرض فیلد
  colspan = 1;

  // برای تعیین واحد: تومان-ریال-کیلو-تعداد-درصد-وغیره
  unit: string;
  getUnit(){ return this.unit };

  // مقدار نهایی که نمایش داده میشود
  finalCost():any{
    return this.cost*this.percent/100
  };

  set setPercent(vals:{val:number|string,exist?:any}) {
    if (vals.exist == undefined) {
      this.percent = vals.val
    } else {
      this.percent = vals.exist
    }
  }
}

@Component({
  selector: 'app-profit-and-loss',
  templateUrl: './profit-and-loss.component.html',
  styleUrls: ['./profit-and-loss.component.css']
})
export class ProfitAndLossComponent extends EstimateComponent implements OnInit,OnDestroy {

  @Output('doAction') doAction = new EventEmitter();
  percent = this.projactService.profitAndLossPercents;
  GlobalPercents = this.projactService.percents;
  stringYear = ["اول","دوم","سوم","چهارم","پنجم","ششم","هفتم","هشتم","نهم","دهم"];
  profitAndLoss:any = {
    incomes:<Iforecast[]>[],
    var:<Iforecast[]>[],
    fix: <Iforecast[]>[],
    profitLoss:<Iforecast[]>[],
    efficiency:<Iforecast[]>[],
    NPVPureValue: <Iforecast[]>[],
    finallyItems: <Iforecast[]>[],
    balanceSheet: <Iforecast[]>[]
  }
  doAllCompute = true;
  subs1$: Subscription;
  // ExpectedRateOfReturn: number = 0;
  irrSubs$: Subscription;
  npvSubs$: Subscription;

  ngOnInit(): void {
    // get martial data
    this.projactService.getUnit().pipe(
      take(2)
    ).subscribe(res => {
      this.unit = res;
      this.period = this.toNum(this.unit.fundAndExpensesForm.time);
    });
    // get estimated data
    this.subs1$ = this.projactService.getCahnges().pipe(
      take(1)
    ).subscribe(res => {
      this.estimated = res;
      this.allComputes();
      console.log(this.profitAndLoss,res);
    });
  }

  ngOnDestroy() {
    this.subs1$.unsubscribe();
  }

  allComputes() {
    this.forecastingVarCosts();
    this.forecastingFixCosts();
    this.incomesCompute();
    this.profitLossCompute();
    this.efficiencyCompute();
    this.NPVPureValue();
    this.otherCompute();
    this.balanceSheet();
  }

  applyChanges(event?:Event) {
    this.efficiencyCompute(true);
    this.NPVPureValue();

    let id = (<HTMLInputElement>event?.target).id;
    setTimeout(() => {
      document.getElementById(id)?.focus();
    }, 0);
  }

  changeYear() {
    Object.keys(this.year).forEach(key => {
      this.year[key] = this.toNum(this.year.profitLoss);
    });
    this.toEstimate(this.year.profitLoss);
    this.allComputes();
    // this.allComputes();
  }

  getWorkingCapitalValue(year?:number){
    this.year.workingCapital = year;
    this.year.building = year;
    this.year.equipment = year;
    this.year.vehicles = year;
    // this.year.salesAndAdsRate = this.year.workingCapital;


    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)

    this.maintenanceCost('any',true)
    this.workingCapital()
    // this.salesAndAdsRate()
    this.bime(this.estimated.workingCapital,this.year.workingCapital);
  }

  forecastingVarCosts() {
    let costs:Iforecast[] = [];
    let e:Iforecast = new Iforecast;
    const year = this.year.profitLoss;
    // rawMaterials
    e.id = 101;
    e.title = 'مواد اولیه (۱۰۰٪)';
    e.setPercent = {val:this.percent.rawMaterials_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.totalRawMaterials ;
    costs.push(e);

    // salary variable costs
    let b = new Iforecast;
    b.id = 102;
    b.title = 'هزينه حقوق و دستمزد (۳۵٪)';
    b.setPercent = {val:this.percent.salary_var,exist:this.getPercent(b.id)};
    let salary = this.estimated.sumSalaryCosts.sum * b.percent/100;
    let cost:number = this.toNum(this.year.profitLoss) > 1?
                       this.recursiveCalc(salary,120,this.toNum(year)): salary;
    b.finalCost = () => {
      return cost;
    }

    costs.push(b);

    // maintenace variable costs
    e = new Iforecast;
    e.id = 103;
    e.title = 'هزینه تعمیرات و نگهداری';
    e.setPercent = {val:this.percent.maintenance_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.maintenanceCost ;
    costs.push(e);

    // administrative And Selling Expenses variable costs
    e = new Iforecast;
    e.id = 104;
    e.title = 'هزینه‌های اداری و فروش';
    e.setPercent = {val:this.percent.administrativeAndSelling_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.administrativeAndSellingExpenses ;
    costs.push(e);

    // unforeseen variable costs
    e = new Iforecast;
    e.id = 105;
    e.title = 'هزینه‌های پیش‌بینی نشده';
    e.setPercent = {val:this.percent.unforeseen_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.unforeseen ;
    costs.push(e);

    // Consumable format var cosrs
    e = new Iforecast;
    e.id = 106;
    e.title = 'قالب های مصرفی ';
    e.setPercent = {val:this.GlobalPercents.ghalebMasrafi,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.ghalebMasrafi;
    e.finalCost = () => { return this.estimated.workingCapital.ghalebMasrafi }
    costs.push(e);

    // Water, electricity, gas and telephone variable Costs
    e = new Iforecast;
    e.id = 107;
    e.title = 'آب برق گاز تلفن (۲۰٪)';
    e.setPercent = {val:this.percent.WEGT_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.WEGT.sum ;
    costs.push(e);

    // Ads variable Costs
    e = new Iforecast;
    e.id = 108;
    e.title = 'هزینه تبلیغات';
    e.setPercent = {val:this.percent.Ads_var,exist:this.getPercent(e.id)};
    e.cost = this.estimated.salesAndAdsRate.adsPercent[this.year.profitLoss-1]
             * this.estimated.salesAndAdsRate.AnnualIncome(this.year.profitLoss-1)/100;
    costs.push(e);

    let sum = costs.reduce((prev:Iforecast,next:Iforecast)=>{
      let v = new Iforecast;
      v.id = 199;
      v.title = 'جمع کل هزینه های متغیر';
      v.setPercent = {val:'--',exist:this.getPercent(e.id)};
      v.highLight = true;
      v.finalCost = () => {
        return prev.finalCost() + next.finalCost();
      }

      return v;
    })

    costs.push(sum)

    this.profitAndLoss.var = costs;
  }

  forecastingFixCosts() {
    let costs:Iforecast[] = [];
    let e:Iforecast = new Iforecast;

    // Deprication Costs
    e.id = 201;
    e.title = 'هزینه استهلاک';
    e.setPercent = {val:this.percent.deprication,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.depreciationCosts ;
    costs.push(e);

    // preOperation Depreciation Costs
    e = new Iforecast;
    e.id = 202;
    e.title = 'استهلاک قبل از بهره‌برداری';
    e.setPercent = {val:this.percent.preOperation_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.preOperationDepreciationCosts ;
    costs.push(e);

    // salary variable costs
    e = new Iforecast;
    e.id = 203;
    e.title = 'هزينه حقوق و دستمزد (۶۵٪)';
    e.setPercent = {val:this.percent.salary_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.sumSalaryCosts.sum ;
    if (this.year.profitLoss > 1) {
      let salary = this.estimated.sumSalaryCosts.sum * e.percent/100;
      e.finalCost = () => {
        let val = this.recursiveCalc(salary,120,this.year.profitLoss);
        return val;
      }
    }
    costs.push(e);

    // maintenace variable costs
    e = new Iforecast;
    e.id = 204;
    e.title = 'هزینه تعمیرات و نگهداری';
    e.setPercent = {val:this.percent.maintenance_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.maintenanceCost ;
    costs.push(e);

    // administrative And Selling Expenses variable costs
    e = new Iforecast;
    e.id = 205;
    e.title = 'هزينه هاي جاري (مواد+نت+قالب+انرژی+...)';
    e.setPercent = {val:this.percent.workingCapital_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.sum ;
    costs.push(e);

    // unforeseen variable costs
    e = new Iforecast;
    e.id = 206;
    e.title = 'هزینه‌های پیش‌بینی نشده';
    e.setPercent = {val:this.percent.unforeseen_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.unforeseen ;
    costs.push(e);

    // Water, electricity, gas and telephone variable Costs
    e = new Iforecast;
    e.id = 207;
    e.title = 'آب برق گاز تلفن (۸۰٪)';
    e.setPercent = {val:this.percent.WEGT_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.WEGT.sum ;
    costs.push(e);

    // Ads variable Costs
    e = new Iforecast;
    e.id = 208;
    e.title = 'بهره تسهيلات بانكي';
    e.setPercent = {val:this.percent.BFInterest_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.annualProductionCosts.bankFacilityCosts ;
    e.cost? '': e.cost = 0;
    costs.push(e);

    // Bime
    e = new Iforecast;
    e.id = 209;
    e.title = 'بیمه کارخانه';
    e.setPercent = {val:this.percent.bime_fix,exist:this.getPercent(e.id)};
    e.cost = this.estimated.workingCapital.bime ;
    costs.push(e);

    let sum = costs.reduce((prev:Iforecast,next:Iforecast)=>{
      let v = new Iforecast;
      v.id = 299;
      v.title = 'جمع کل هزینه های ثابت';
      v.setPercent = {val:'--'};
      v.highLight = true;
      v.finalCost = () => {
        return prev.finalCost() + next.finalCost();
      }

      return v;
    })

    costs.push(sum)

    this.profitAndLoss.fix = costs;
  }

  incomesCompute() {
    let incomes: Iforecast[] = [];
    let sales = this.estimated.salesAndAdsRate;
    
    for (let i = 0; i < sales.count.length; i++) {
      let income = new Iforecast;
      income.id = 301+i;
      income.title = "سال " + this.stringYear[i]
      income.finalCost = () => {
        return sales.AnnualIncome(i);
      };
      incomes.push(income);
    }

    let sum = incomes.reduce((prev:Iforecast,next:Iforecast)=>{
      let v = new Iforecast;
      v.title = 'جمع کل درآمدها';
      v.finalCost = () => {
        return prev.finalCost() + next.finalCost();
      }
      return v;
    })
    incomes.push(sum);
  
    this.profitAndLoss.incomes = incomes;
  }

  profitLossCompute() {
    let year = this.year.profitLoss
    let data:Iforecast[] = []
    
    // سود ناخالص
    let a = new Iforecast;
    a.id = 401;
    a.title = 'سود ناخالص';
    a.description = `سود ناخالص (در استاندارد ایران همان فروش خالص) مجموع درآمدی است که تنها هزینه‌های مستقیم عملیاتی از آن کسر شده باشد.
     منظور از هزینه‌های مستقیم عملیاتی هزینه‌هایی است که به طور مستقیم به سبب فروش کالا یا ارائه‌ی خدمات ایجاد شده‌اند.
     به این هزینه‌ها در حسابداری «بهای تمام شده‌ی کالای فروش رفته» گفته می‌شود. بهای تمام شده‌ی کالای فروش رفته شامل هزینه‌ی خرید مواد خام اولیه و هزینه‌ی دستمزد تولید می‌شود.
     سایر دستمزدها و هزینه‌‌هایی مثل اجاره در بهای تمام شده کالای فروش رفته منظور نمی‌شود. [منظور از سایر دستمزدها و اجاره و به طور کلی هزینه‌هایی که وارد بهای تمام شده‌ی کالای فروش رفته نمی‌شوند، هزینه‌هایی هستند که مستقیماً با تولید کالا یا ارائه‌ی خدمات در ارتباط نیستند.
     به عنوان مثال دستمزد مدیران بخش اداری یا هزینه‌ی اجاره‌ی فروشگاه مربوط به فروش محصولات کارخانه- م.] در حالیکه سود ناخالص از نظر فنی یک مقدار خالص از سود را نشان می‌دهد، با این حال در حسابداری به عنوان ناخالص شناخته می‌شود چرا که بدهی‌ها، مالیات‌ها، بهره‌ها و … را شامل نمی‌شود.`;
    a.finalCost = () => {
      let v = this.profitAndLoss.incomes[year-1].finalCost() - this.getSumOfForecasts(101,102,103,105,107,203,204,206,207,209);      
      return v;
    }    
    data.push(a);

    // سود و زیان ویژه
    let b = new Iforecast;
    b.id = 402;
    b.title = 'سود / زیان قبل از كسر مالیات';
    b.description = ' (سود و زیان ویژه)';
    b.finalCost = () => {
      let v = this.profitAndLoss.incomes[year-1].finalCost() - this.getSumOfForecasts(199,299);
      return v;
    }
    
    data.push(b)

    // سود عملیاتی
    let c = new Iforecast;
    c.id = 403;
    c.title = 'سود عملیاتی';
    c.description = `مرحله‌‌ی بعد در صورت سود و زیان محاسبه‌ی سود عملیاتی است.
     سود عملیاتی نشان دهنده‌ی باقیمانده‌ی سود بعد از محاسبه‌ی تمام هزینه‌های مربوط به واحد تجاری است.
     علاوه بر بهای تمام شده‌ی کالای فروش رفته، هزینه‌های ثابتی نظیر اجاره و بیمه، هزینه‌های متغیری نظیر هزینه‌ی حمل و نقل و کرایه، حقوق و دستمزد و استهلاک در محاسبه‌ی سودعملیاتی در نظر گرفته می‌شوند.
     در حقیقت تمام هزینه‌هایی که بر حفظ فعالیت واحد تجاری ضروری هستند باید در محاسبه‌ی سودعملیاتی در نظر گرفته شوند.
     با این حال سود عملیاتی نیز همانند سودناخالص دربردارنده‌ی بهره‌های پرداختی بابت بدهی‌ها، درآمد ناشی از سرمایه‌گذاری‌ها و مالیات نمی‌شود. سود عملیاتی قابلیت سوددهی عملیاتی یک واحد تجاری را مشخص می‌نماید.`;
    c.finalCost = () => {
      let v = a.finalCost() - this.getSumOfForecasts(104);
      return v;
    }
    data.push(c);

    // مالیات
    let tax = new Iforecast;
    tax.id = 404;
    tax.title = 'مالیات';
    tax.finalCost = () => {
      let v = 0;
      if (b.finalCost()>0) {
        v = b.finalCost() * 25/100;
      }
      return v;
    }
    data.push(tax);

    // ارزش افزوده ناخالص
    let d = new Iforecast;
    d.id = 405;
    d.title = 'ارزش افزوده‌ی ناخالص';
    d.finalCost = () => {
      let v = this.profitAndLoss.incomes[year-1].finalCost() - this.getSumOfForecasts(101,103,107,204,207);
      return v;
    }
    data.push(d);

    // سود | زیان خالص حسابداری
    let e = new Iforecast;
    e.id = 406;
    e.title = 'سود/زیان خالص حسابداری';
    e.finalCost = () => {
      let v = b.finalCost() - tax.finalCost();
      return v;
    }
    data.push(e);

    // ارزش افزوده‌ی خالص
    let f = new Iforecast;
    f.id = 407;
    f.title = 'ارزش افزوده‌ی خالص';
    f.finalCost = () => {
      let v = d.finalCost() + this.getSumOfForecasts(201,202);
      return v;
    }
    data.push(f);

    // اصل وام پرداختنی
    let g = new Iforecast;
    g.id = 408;
    g.title = 'اصل وام پرداختنی';
    g.description = `بازپرداخت اصل وام از محل (سود خالص+استهلاک) صورت می پذیرد فلذا فزونی اصل وام پرداختنی در یک سال بر سود خالص حسابداری آن سال، به معنای مضیقه در بازپرداخت اصل وام نخواهدبود`;
    g.finalCost = () => {
      let v = this.GlobalPercents.installmentCount > (year-1)*12 ?
              this.getSumOfArrays(this.estimated.bankFacilities.installments.principal,(year-1)*12):
              0;
      return v;
    }
    data.push(g);

    // نسبت ارزش افزوده‌ی ناخالص به فروش
    let h = new Iforecast;
    h.id = 409;
    h.title = 'نسبت ارزش افزوده‌ی ناخالص به فروش';
    h.type = 'float';
    h.unit = ' ';
    h.finalCost = () => {
      let v = d.finalCost() / this.profitAndLoss.incomes[year-1].finalCost();
      return v;
    }
    data.push(h);

    // تامین مالی سرمایه درگردش موردنیاز جهت تولید در سال بعد
    let i = new Iforecast;
    i.id = 410;
    i.title = 'سرمایه مورد نیاز سال بعد';
    i.description = `تامین مالی سرمایه درگردش موردنیاز جهت تولید در سال بعد. -- مقدار سرمایه درگردش هر سال افزایش می یابد. جهت تداوم تولید، این سرمایه درگردش مازاد می بایست هر ساله تامین مالی گردد، در اینجا فرض شده است که مازاد سرمایه در گردش مورد نیاز در هر سال از محل سود خالص تامین مالی می گردد (نه تسهیلات بانکی)`;
    let val2:number,val1:number = this.estimated.workingCapital.sumInPeriod;
    // setTimeout(() => {
      // برای دریافت مجموع سرمایه درگردش یک سال جلوتر 
      let nextYear = this.toNum(year) + 1;

      this.getWorkingCapitalValue(nextYear);
      val2 = this.estimated.workingCapital.sumInPeriod;

      i.finalCost = () => {
        return val2-val1;
      }
      this.getWorkingCapitalValue(year);
    // }, 0);
    data.push(i);

    // نسبت ارزش افزوده‌ی خالص به فروش
    let j = new Iforecast;
    j.id = 411;
    j.title = `نسبت ارزش افزوده‌ی خالص به فروش`;
    j.type = 'float';
    j.unit = ' ';
    j.finalCost = () => {
      return f.finalCost() / this.profitAndLoss.incomes[year-1].finalCost();
    }
    data.push(j);

    // سود قابل تقسیم حسابداری
    let k = new Iforecast;
    k.id = 412;
    k.title = 'سود قابل تقسیم حسابداری';
    k.finalCost = () => {
      let v = e.finalCost() <= g.finalCost()+i.finalCost()? 0: e.finalCost()-g.finalCost()-i.finalCost();
      return v;
    }
    data.push(k);

    // نسبت ارزش افزوده خالص سالیانه به کل سرمایه
    let l = new Iforecast;
    l.id = 413;
    l.title = 'نسبت ارزش افزوده خالص سالیانه به کل سرمایه';
    l.type = 'float';
    l.unit = ' ';
    l.finalCost = () => {
      let val = f.finalCost() / this.estimated.financialSummary.totalCapitalRequired;
      return val;
    }
    data.push(l);

    // وجه نقد باقی مانده برای سهامدار در پایان سال
    let m = new Iforecast;
    m.id = 414;
    m.title = 'وجه نقد باقی مانده برای سهامدار در پایان سال';
    m.description = `سود خالص بعلاوه استهلاک منهای اصل وام`;
    m.finalCost = () => {
      let val = e.finalCost() + this.getSumOfForecasts(202) - g.finalCost() - i.finalCost();
      return val;
    }
    data.push(m);

    // وجه نقد باقی مانده سهامدار به آورده سهامدار  (%)
    let n = new Iforecast;
    n.id = 415;
    n.title = 'درصد وجه نقد باقی مانده سهامدار به آورده سهامدار';
    n.type = 'float';
    n.unit = '%';
    n.finalCost = () => {
      let val = m.finalCost() / (this.estimated.financialSummary.totalCapitalRequired - this.estimated.bankFacilities.bankLoan)*100;
      return val;
    }
    data.push(n);

    this.profitAndLoss.profitLoss = data;
  }

  //  نرخ بازده داخلی (IRR)
  callGetIRRFunc = new BehaviorSubject(false);
  shareholdeIRR: number;
  shareholdeIRR_Unit: string;
  planIRR: number;
  planIRR_Unit: string;
  efficiencyCompute(applyChanges=false) {
    let year = this.year.profitLoss
    let data:Iforecast[] = [];

    // جریان نقد ورودی کل طرح
    let a = new Iforecast;
    a.id = 501;
    a.title = 'جریان نقد ورودی کل طرح';
    a.finalCost = () => {
      let val = this.getSumOfForecasts(202,208,402);
      return val;
    }
    data.push(a);

    // نرخ بازده داخلی طرح در افق ده ساله (%)
    let c = new Iforecast;
    c.id = 502;
    c.title = 'نرخ بازده داخلی طرح در افق ده ساله (%)';
    c.type = 'float';
    c.getUnit = () => this.planIRR_Unit;
  
    this.callGetIRRFunc.asObservable().subscribe(res => {
      if (!res || applyChanges){
        applyChanges = false;
        // this.callGetIRRFunc.next(true);
        this.projactService.callGetIRR.next(true);
      }
    });
    c.finalCost = () => {
      return this.planIRR;
    }

    data.push(c);

    // نرخ بازده داخلی آورده سهامدار در افق ده ساله (%)
    let d = new Iforecast;
    d.id = 503;
    d.title = 'نرخ بازده داخلی آورده سهامدار در افق ده ساله (%)';
    d.type = 'float';
    d.getUnit = () => this.shareholdeIRR_Unit;
  
    this.callGetIRRFunc.asObservable().subscribe(res => {
      if (!res)
      this.callGetIRRFunc.next(true);
    })
    d.finalCost = () => {
      return this.shareholdeIRR;
    }

    data.push(d);
  
    this.profitAndLoss.efficiency = data;
  }

  //  ارزش فعلی خالص (NPV) در افق ده ساله و دوره بازگشت آورده سهامدار
  NPV_value:number;
  NPVPureValue() {
    let year = this.year.profitLoss;
    let data:Iforecast[] = [];

    // نرخ بازده مورد انتظار سهامدار (%)
    let a = new Iforecast;
    a.id = 521;
    a.title = "نرخ بازده مورد انتظار سهامدار (%)";
    a.type = 'string';
    a.setPercent = {val:0,exist:this.getPercent(a.id)};
    a.finalCost = () => '--';
    data.push(a);

    // ارزش فعلی خالص طرح
    let b = new Iforecast;
    b.id = 522;
    b.title = 'ارزش فعلی خالص طرح';
    b.setPercent = {val:'--'};
    this.projactService.callGetNPV.next(this.getPercent(521));
    b.finalCost = () => {
      return this.NPV_value;
    }
    data.push(b);

    // دوره بازگشت آورده سهامدار (با لحاظ ارزش زمانی پول)
    let c = new Iforecast;
    c.id = 523;
    c.title = "دوره بازگشت آورده سهامدار (با لحاظ ارزش زمانی پول)";
    c.setPercent = {val:'--'}
    c.finalCost = () => {
      let Y = ''; // Year
      let M = ''; // Month
      return `${Y} سال و ${M} ماه`;
    }
    data.push(c);

    // میزان فروش در نقطه سر به سر (سال اول)
    let d = new Iforecast;
    d.id = 524;
    d.title = "میزان فروش در نقطه سر به سر ";
    d.colspan = 2;
    d.type = 'string';
    d.finalCost = () => {
      let val1 = this.getSumOfForecasts(299)/
                  (this.estimated.salesAndAdsRate.yearlyPrice[year-1]-
                    (this.getSumOfForecasts(199)/this.estimated.salesAndAdsRate.count[year-1])
                  );
      let val2 = (val1/this.estimated.salesAndAdsRate.count[year-1])*100;

      return `${this.toNum(val1)} دستگاه معادل با ${this.toNum(val2)} درصد ظرفیت واقعی`;
    }
    data.push(d);

    // بهای تمام شده هر دستگاه
    let e = new Iforecast;
    e.id = 525;
    e.title = 'بهای تمام شده هر دستگاه';
    e.percent = '--';
    e.finalCost = () => {
      let sum = this.getSumOfForecasts(199,299);
      let val = sum / this.estimated.salesAndAdsRate.count[year-1];
      return val;
    }
    data.push(e);

    this.profitAndLoss.NPVPureValue = data;
  }

  otherCompute() {
    let year = this.year.profitLoss;
    let data:Iforecast[] = [];

    // قیمت فروش پایه با احتساب ۳۰٪ بیشتر از بهای تمام شده
    let a = new Iforecast;
    a.id = 601;
    a.title = 'قیمت فروش پایه با احتساب ۳۰٪ بیشتر از بهای تمام شده';
    a.finalCost = () => {
      return this.getSumOfForecasts(525)*1.3;
    }
    data.push(a);

    // هزینه‌ی متغیر هر واحد
    a = new Iforecast;
    a.id = 602;
    a.title = 'هزینه‌ی متغیر هر واحد';
    a.finalCost = () => {
      return this.getSumOfForecasts(199) / this.estimated.salesAndAdsRate.count[0];
    }
    data.push(a);

    // درصد فروش در نقطه‌ی سر بسر
    a = new Iforecast;
    a.id = 603;
    a.title = 'درصد فروش در نقطه‌ی سر بسر';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      let val = this.getSumOfForecasts(299) /
        (this.estimated.salesAndAdsRate.AnnualIncome(0)-this.getSumOfForecasts(199)) * 100;
      return val;
    }
    data.push(a);

    // سرمایه‌ی ثابت سرانه
    a = new Iforecast;
    a.id = 604;
    a.title = 'سرمایه‌ی ثابت سرانه';
    a.finalCost = () => {
      return this.estimated.financialSummary.sum / this.estimated.sumSalaryCosts.count
    }
    data.push(a);

    // سرانه کل سرمایه‌گذاری
    a = new Iforecast;
    a.id = 605;
    a.title = 'سرانه کل سرمایه‌گذاری';
    a.finalCost = () => {
      return this.estimated.financialSummary.totalCapitalRequired / this.estimated.sumSalaryCosts.count;
    }
    data.push(a);

    // نرخ بازدهی سرمایه‌ی ساده
    a = new Iforecast;
    a.id = 606;
    a.title = 'نرخ بازدهی سرمایه‌ی ساده';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      let val = this.getSumOfForecasts(208,402) / this.estimated.financialSummary.totalCapitalRequired;
      return val;
    }
    data.push(a);

    // دوره‌ی بازگشت سرمایه
    a = new Iforecast;
    a.id = 607;
    a.title = 'دوره‌ی بازگشت سرمایه';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      let val = this.estimated.financialSummary.totalCapitalRequired / this.getSumOfForecasts(201,202,208,402);
      return val;
    }
    data.push(a);

    // حاشیه سود ناخالص = نسبت سودناخالص به فروش خالص
    a = new Iforecast;
    a.id = 608;
    a.title = 'حاشیه سود ناخالص ';
    a.description = 'نسبت سودناخالص به فروش خالص';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      return this.getSumOfForecasts(402) / this.estimated.salesAndAdsRate.AnnualIncome(this.year.profitLoss-1);
    }
    data.push(a);

    // حاشیه سود خالص = نسبت سودخالص به فروش خالص
    a = new Iforecast;
    a.id = 609;
    a.title = 'حاشیه سود خالص ';
    a.description = 'نسبت سودخالص به فروش خالص';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      return this.getSumOfForecasts(406) / this.estimated.salesAndAdsRate.AnnualIncome(this.year.profitLoss-1);
    }
    data.push(a);

    // حقوق و دستمزد سالیانه
    a = new Iforecast;
    a.id = 610;
    a.title = 'حقوق و دستمزد سالیانه';
    a.finalCost = () => {
      return this.getSumOfForecasts(102,203);
    }
    data.push(a);

    // تعمیزات و نگهداری سالانه
    a = new Iforecast;
    a.id = 611;
    a.title = 'تعمیرات و نگهداری سالانه';
    a.finalCost = () => {
      return this.getSumOfForecasts(103,204);
    }
    data.push(a);

    // انرژی مصرفی سالانه
    a = new Iforecast;
    a.id = 612;
    a.title = 'انرژی مصرفی سالانه';
    a.finalCost = () => {
      return this.getSumOfForecasts(107,207);
    }
    data.push(a);

    // جمع هزینه‌های غیر عملیاتی
    a = new Iforecast;
    a.id = 613;
    a.title = 'جمع هزینه‌های غیر عملیاتی';
    a.finalCost = () => {
      return this.getSumOfForecasts(208,202);
    }
    data.push(a);

    this.profitAndLoss.finallyItems = data;
  }

  // ترازنامه تخمینی
  balanceSheet() {
    let year = this.year.profitLoss;
    let data:Iforecast[] = [];

    // تعداد دستگاه تولیدی
    let a = new Iforecast;
    a.id = 701;
    a.title = 'تعداد دستگاه تولیدی';
    a.unit = 'عدد';
    a.finalCost = () => {
      return this.estimated.salesAndAdsRate.count[year-1]
    }
    data.push(a);

    // فروش خالص
    a = new Iforecast;
    a.id = 702;
    a.title = 'فروش خالص';;
    a.finalCost = () => {
      return this.estimated.salesAndAdsRate.AnnualIncome(year-1)/1000;
    }
    data.push(a);

    // مواد اولیه
    a = new Iforecast;
    a.id = 703;
    a.title = 'مواد اولیه';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.totalRawMaterials/1000;
    }
    data.push(a);

    // حقوق و دستمزد
    a = new Iforecast;
    a.id = 704;
    a.title = 'حقوق و دستمزد';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.salary/1000;
    }
    data.push(a);

    // تعمیرات و نگهداری
    a = new Iforecast;
    a.id = 705;
    a.title = 'تعمیرات و نگهداری';
    a.finalCost = () => {
      let val = this.estimated.maintenanceCost.building +
        this.estimated.maintenanceCost.equipment + this.estimated.maintenanceCost.vehicles;

      return val/1000;
    }
    data.push(a);

    // انرژی مصرفی
    a = new Iforecast;
    a.id = 706;
    a.title = 'انرژی مصرفی';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.WEGT/1000;
    }
    data.push(a);

    // هزینه پیش بینی نشده
    a = new Iforecast;
    a.id = 707;
    a.title = 'هزینه پیش بینی نشده';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.unforeseen/1000;
    }
    data.push(a);

    // استهلاک دارائی های ثابت
    a = new Iforecast;
    a.id = 708;
    a.title = 'استهلاک دارائی های ثابت';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.depreciationCosts/1000;
    }
    data.push(a);

    // بیمه کارخانه
    a = new Iforecast;
    a.id = 709;
    a.title = 'بیمه کارخانه';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.bime/1000;
    }
    data.push(a);

    // جمع هزینه ها
    a = new Iforecast;
    a.id = 710;
    a.title = 'جمع هزینه ها';
    a.finalCost = () => {
      return this.getSumOfForecasts(703,704,705,706,707,708,709);
    }
    data.push(a);

    // سود ناخالص
    a = new Iforecast;
    a.id = 711;
    a.title = 'سود ناخالص';
    a.finalCost = () => {
      return this.getSumOfForecasts(702)-this.getSumOfForecasts(710);
    }
    data.push(a);

    // هزینه های اداری و فروش
    a = new Iforecast;
    a.id = 712;
    a.title = 'هزینه های اداری و فروش';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.administrativeAndSellingExpenses/1000;
    }
    data.push(a);

    // سود عملیاتی
    a = new Iforecast;
    a.id = 713;
    a.title = 'سود عملیاتی';
    a.finalCost = () => {
      return this.getSumOfForecasts(711) - this.getSumOfForecasts(712);
    }
    data.push(a);

    // استهلاک هزینه های قبل بهره برداری
    a = new Iforecast;
    a.id = 714;
    a.title = 'استهلاک هزینه های قبل بهره برداری';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.preOperationDepreciationCosts/1000;
    }
    data.push(a);

    // هزینه تسهیلات مالی
    a = new Iforecast;
    a.id = 715;
    a.title = 'هزینه تسهیلات مالی';
    a.finalCost = () => {
      return this.estimated.annualProductionCosts.bankFacilityCosts/1000;
    }
    data.push(a);

    // جمع هزینه های غیر عملیاتی
    a = new Iforecast;
    a.id = 716;
    a.title = 'جمع هزینه های غیر عملیاتی';
    a.finalCost = () => {
      return this.getSumOfForecasts(714,715);
    }
    data.push(a);

    // سود و زیان ویژه
    a = new Iforecast;
    a.id = 717;
    a.title = 'سود و زیان ویژه';
    a.finalCost = () => {
      return this.getSumOfForecasts(713)-this.getSumOfForecasts(716);
    }
    data.push(a);

    // وجه نقد باقیمانده برای سهامداران
    a = new Iforecast;
    a.id = 718;
    a.title = 'وجه نقد باقیمانده برای سهامداران';
    a.finalCost = () => {
      return this.getSumOfForecasts(414)/1000;
    }
    data.push(a);

    // سود سنواتی (٪)
    a = new Iforecast;
    a.id = 719;
    a.title = 'سود سنواتی (٪)';
    a.type = 'float';
    a.unit = '%';
    a.finalCost = () => {
      return this.getSumOfForecasts(415);
    }
    data.push(a);

    this.profitAndLoss.balanceSheet = data;
  }

  // for public computes
  recursiveCalc(cost:number,percent:number,year:number):any {
    let v = cost * percent/100;
    if (year <= 2) {
      return v;
    } else {
      return this.recursiveCalc(v,percent,year-1);
    }
  }

  IRRvalues(event:any) {
    this.shareholdeIRR = event.shareholdeIRR;
    this.shareholdeIRR_Unit = typeof event.shareholdeIRR == 'string'? 'Error': '%';
    this.planIRR = event.planIRR;
    this.planIRR_Unit = typeof event.planIRR == 'string'? 'Error': '%';
  }

  setNPV(npv:number) {
    this.NPV_value = npv;
  }

  getPercent(id:number) {
    let array:Iforecast[] = [
      this.profitAndLoss.var,this.profitAndLoss.fix,this.profitAndLoss.incomes,
      this.profitAndLoss.profitLoss,this.profitAndLoss.efficiency,this.profitAndLoss.NPVPureValue
    ];
    let percent = array.flat().find((item:Iforecast) => item.id == id)?.percent;

    return percent
  }

  /**
   * ایدی یا ایدی های موارد دلخواه را وارد کنید و مجموع مقادیر انها را دریافت نمایید.
   * @param ids لیست ایدی موارد دلخواه
   * @returns مجموع مقدار موارد خواسته شده 
   */
  getSumOfForecasts(...ids:number[]) {
    let array:Iforecast[] = [
      this.profitAndLoss.var,this.profitAndLoss.fix,this.profitAndLoss.incomes,
      this.profitAndLoss.profitLoss,this.profitAndLoss.efficiency,this.profitAndLoss.NPVPureValue,
      this.profitAndLoss.balanceSheet
    ];
    array = array.flat().filter((item:Iforecast) => ids.includes(item.id));
    let sum = array.reduce((prev:Iforecast,next:Iforecast) => {
      let v = new Iforecast;
      v.finalCost = () => {
        return prev.finalCost() + next.finalCost();
      }
      return v;
    });

    return sum.finalCost();
  }

}