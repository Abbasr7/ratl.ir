import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IEstimate } from 'src/app/controlers/interfaces/interfaces';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';

export class Iforecast {
  id: number;
  title: string;
  percent: number;
  cost: number;
  description: string;
  finalCost(){
    return this.cost*this.percent/100
  }
}

@Component({
  selector: 'app-profit-and-loss',
  templateUrl: './profit-and-loss.component.html',
  styleUrls: ['./profit-and-loss.component.css']
})
export class ProfitAndLossComponent implements OnInit {

  constructor(private projactService:ProjactsService) { }

  @Output('doAction') doAction = new EventEmitter();
  percents = this.projactService.profitAndLossPercents;
  GlobalPercents = this.projactService.percents;
  estimated = new IEstimate();
  year = this.projactService.year;
  stringYear = ["اول","دوم","سوم","چهارم","پنجم","ششم","هفتم","هشتم","نهم","دهم"];

  money = 'تومان';
  profitAndLoss:any = {
    incomes:[],
    var:[],
    fix:[],
    profitLoss:[]
  }
  doAllCompute = true;

  ngOnInit(): void {

    this.projactService.getCahnges().subscribe(res => {
      this.estimated = res;
      
      if (this.doAllCompute) {
        this.allComputes();
      }
      console.log(this.profitAndLoss);
      
    })
  }

  allComputes() {
    this.forecastingVarCosts();
    this.forecastingFixCosts();
    this.incomesCompute();
    this.profitLossCompute();
  }

  applyChanges(){}

  forecastingVarCosts() {
    let costs:Iforecast[] = [];
    let e:Iforecast = new Iforecast;
    // rawMaterials
    e.id = 101;
    e.title = 'مواد اولیه (۱۰۰٪)';
    e.percent = this.percents.rawMaterials_var;
    e.cost = this.estimated.workingCapital.totalRawMaterials ;
    costs.push(e);

    // salary variable costs
    e = new Iforecast;
    e.id = 102;
    e.title = 'هزينه حقوق و دستمزد (۳۵٪)';
    e.percent = this.percents.salary_var;
    e.cost = this.estimated.sumSalaryCosts.sum ;
    if (this.year.profitLoss > 1) {
      e.cost = this.recursiveCalc(e.cost,120,this.year.profitLoss)!;
    }
    costs.push(e);

    // maintenace variable costs
    e = new Iforecast;
    e.id = 103;
    e.title = 'هزینه تعمیرات و نگهداری';
    e.percent = this.percents.maintenance_var;
    e.cost = this.estimated.workingCapital.maintenanceCost ;
    costs.push(e);

    // administrative And Selling Expenses variable costs
    e = new Iforecast;
    e.id = 104;
    e.title = 'هزینه‌های اداری و فروش';
    e.percent = this.percents.administrativeAndSelling_var;
    e.cost = this.estimated.annualProductionCosts.administrativeAndSellingExpenses ;
    costs.push(e);

    // unforeseen variable costs
    e = new Iforecast;
    e.id = 105;
    e.title = 'هزینه‌های پیش‌بینی نشده';
    e.percent = this.percents.unforeseen_var;
    e.cost = this.estimated.annualProductionCosts.unforeseen ;
    costs.push(e);

    // Consumable format var cosrs
    e = new Iforecast;
    e.id = 106;
    e.title = 'قالب های مصرفی ';
    e.percent = this.GlobalPercents.ghalebMasrafi;
    e.cost = this.estimated.workingCapital.ghalebMasrafi;
    e.finalCost = () => { return this.estimated.workingCapital.ghalebMasrafi }
    costs.push(e);

    // Water, electricity, gas and telephone variable Costs
    e = new Iforecast;
    e.id = 107;
    e.title = 'آب برق گاز تلفن (۸۰٪)';
    e.percent = this.percents.WEGT_var;
    e.cost = this.estimated.workingCapital.WEGT.sum ;
    costs.push(e);

    // Ads variable Costs
    e = new Iforecast;
    e.id = 108;
    e.title = 'هزینه تبلیغات';
    e.percent = this.percents.Ads_var;
    e.cost = this.estimated.salesAndAdsRate.adsPercent[this.year.profitLoss-1]
             * this.estimated.salesAndAdsRate.yearlyPrice[this.year.profitLoss-1]/100;
    costs.push(e);

    let sum = costs.reduce((prev:Iforecast,next:Iforecast)=>{
      let v = new Iforecast;
      v.id = 199;
      v.title = 'جمع کل هزینه های متغیر';
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
    e.percent = this.percents.deprication;
    e.cost = this.estimated.annualProductionCosts.depreciationCosts ;
    costs.push(e);

    // preOperation Depreciation Costs
    e = new Iforecast;
    e.id = 202;
    e.title = 'استهلاک قبل از بهره‌برداری';
    e.percent = this.percents.preOperation_fix;
    e.cost = this.estimated.annualProductionCosts.preOperationDepreciationCosts ;
    costs.push(e);

    // salary variable costs
    e = new Iforecast;
    e.id = 203;
    e.title = 'هزينه حقوق و دستمزد (۶۵٪)';
    e.percent = this.percents.salary_fix;
    e.cost = this.estimated.sumSalaryCosts.sum ;
    if (this.year.profitLoss > 1) {
      e.finalCost = () => {
        return this.recursiveCalc(e.cost,120,this.year.profitLoss)!;
      }
    }
    costs.push(e);

    // maintenace variable costs
    e = new Iforecast;
    e.id = 204;
    e.title = 'هزینه تعمیرات و نگهداری';
    e.percent = this.percents.maintenance_fix;
    e.cost = this.estimated.workingCapital.maintenanceCost ;
    costs.push(e);

    // administrative And Selling Expenses variable costs
    e = new Iforecast;
    e.id = 205;
    e.title = 'هزينه هاي جاري (مواد+نت+قالب+انرژی+...)';
    e.percent = this.percents.workingCapital_fix;
    e.cost = this.estimated.workingCapital.sum ;
    costs.push(e);

    // unforeseen variable costs
    e = new Iforecast;
    e.id = 206;
    e.title = 'هزینه‌های پیش‌بینی نشده';
    e.percent = this.percents.unforeseen_fix;
    e.cost = this.estimated.annualProductionCosts.unforeseen ;
    costs.push(e);

    // Water, electricity, gas and telephone variable Costs
    e = new Iforecast;
    e.id = 207;
    e.title = 'آب برق گاز تلفن (۸۰٪)';
    e.percent = this.percents.WEGT_fix;
    e.cost = this.estimated.workingCapital.WEGT.sum ;
    costs.push(e);

    // Ads variable Costs
    e = new Iforecast;
    e.id = 208;
    e.title = 'بهره تسهيلات بانكي';
    e.percent = this.percents.BFInterest_fix;
    e.cost = this.estimated.annualProductionCosts.bankFacilityCosts ;
    e.cost? '': e.cost = 0;
    costs.push(e);

    // Bime
    e = new Iforecast;
    e.id = 209;
    e.title = 'بیمه کارخانه';
    e.percent = this.percents.bime_fix;
    e.cost = this.estimated.workingCapital.bime ;
    costs.push(e);

    let sum = costs.reduce((prev:Iforecast,next:Iforecast)=>{
      let v = new Iforecast;
      v.id = 299;
      v.title = 'جمع کل هزینه های ثابت';
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
    let val1 = this.estimated.workingCapital.sumInPeriod;
      // برای دریافت مجموع سرمایه درگردش یک سال جلوتر 
    this.doAllCompute = false;
    this.doAction.emit({action: 'workingCapital', year: year+1});
    let val2 = this.estimated.workingCapital.sumInPeriod;
      // برگشت دیتا به حالت عادی
    // this.doAction.emit({action: 'workingCapital', year: year});

    console.log(val1,val2);
    
    i.finalCost = () => {
      let m1 = this.estimated.workingCapital.sumInPeriod;
      
      let m2 = this.estimated.workingCapital.sumInPeriod;
 
      return m2-m1;
    }
    // this.doAction.emit();
    data.push(i);

    this.profitAndLoss.profitLoss = data;
  }

  // for public coputes
  recursiveCalc(cost:number,percent:number,year:number) {
    let val = cost * percent/100;

    if (year < 2) {
      return val;
    } else {
      this.recursiveCalc(val,percent,year-1);
    }
  }

  getSumOfForecasts(...ids:number[]) {
    let array:Iforecast[] = [this.profitAndLoss.var,this.profitAndLoss.fix,this.profitAndLoss.incomes];
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

  getSumOfArrays(array:number[],toAndis:number){
    let sum = 0;
    let from = toAndis - 12;
    if (from >= 0) {
      for (let i = from; i < toAndis; i++) {
        sum += array[i];
      }
    }
    return sum
  }
}