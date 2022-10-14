import { KeyValue } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, map, take } from 'rxjs';
import { IEstehlak, IEstimate, IProjact, IRate, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { ServerService } from 'src/app/controlers/services/server.service';

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent {

  constructor(
    public route: ActivatedRoute,
    public projactService: ProjactsService,
    public server: ServerService,
    private msgService: MessagesService
  ) { }

  unit: IProjact = new IProjact
  unit_id = this.route.snapshot.paramMap.get('id');
  rate = this.projactService.rate
  estimated = new IEstimate;

  basePrice:number = this.projactService.basePrice;
  year:any = {
    building: 1,
    equipment: 1,
    vehicles: 1,
    officeEquipment: 1,
    preOperation: 1,
    unforeseen: 1,
    workingCapital: 1,
    salesAndAdsRate: 1,
    bankFacilities: 1,
    annualPC: 1,
    profitLoss:1,
  };
  percents = this.projactService.percents;
  profitAndLossPercents = this.projactService.profitAndLossPercents;

  activeTab: number = 0;
  money:string = 'ریال';
  period:number = this.projactService.period;
  productionCapacity:number = this.projactService.productionCapacity;
  tanafos:number = this.projactService.tanafos = 0;

  getCurrentUnit() {
    (async () => {
      this.unit = await lastValueFrom(this.projactService.getById(this.unit_id!).pipe(
        map(res => res as SuccessHandle),
        map(res => res.data as IProjact),
      ))
      this.projactService.setUnit.next(this.unit);

      this.projactService.getParams(this.unit._id).pipe(
        take(2)
      ).subscribe(res => {
        if (res.data) {
          this.projactService.setParams(res.data)
        }
      });

      this.period = this.projactService.period = 
        this.projactService.period? this.projactService.period:
          this.toNum(this.unit.fundAndExpensesForm.time);

      this.productionCapacity = this.projactService.productionCapacity =
        this.projactService.productionCapacity? this.projactService.productionCapacity:
          this.toNum(this.unit.fundAndExpensesForm.zarfiyateSalane);
  
      this.toEstimate();
    })()
  }

  // getBasePrice() {
  //   this.projactService.basePrice.asObservable().pipe(
  //     take(1)
  //   ).subscribe(res => {
  //     this.basePrice = res
  //   })
  // }

  // setBasePrice(bp:number) {
  //   this.projactService.basePrice.next(bp);
  // }

  toEstimate(year: number = 1) {
    this.projactService.setChanges.next(new IEstimate);
    this.depreciationCalculate('equipment', this.year.equipment);
    this.depreciationCalculate('building', this.year.building);
    this.depreciationCalculate('vehicles', this.year.vehicles);
    this.depreciationCalculate('officeEquipment', this.year.officeEquipment);
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

    this.projactService.setChanges.next(this.estimated);
  }

  saveParamsChanges() {
    this.parametersChanged();
    lastValueFrom(
      this.projactService.saveParams(<string>this.unit_id)
    ).then(res => {
      this.msgService.sendMessage('تغییرات با موفقیت ذخیره گردید.','success')
    })
  }

  depreciationCalculate(type: string, year: number, customItem:any = null) {
    let sum:IEstehlak = {
      year: year,
      title: 'مجموع',
      estehlak: 0,
      arzeshDaftari: 0,
      sumOfCosts: 0,
    }
    let vals: IEstehlak[] = []
    let items = customItem? customItem : this.unit.investForm[type as keyof IHasDepreciation];
    items.forEach((item: any) => {
      let getEstehlak = this.projactService.estehlakHarSal(type, item, year)
      sum.estehlak += getEstehlak.estehlak
      sum.arzeshDaftari += getEstehlak.arzeshDaftari
      sum.sumOfCosts += this.toNum(item.count) * this.toNum(item.cost)
      vals.push(getEstehlak)
    })
    if (type == 'officeEquipment'){
      let other = {
        count: 1,
        cost: sum.sumOfCosts * 5/100,
        title: 'سایر'
      };
      let othersData = this.projactService.estehlakHarSal(type, other, year)
      sum.estehlak += othersData.estehlak;
      sum.arzeshDaftari += othersData.arzeshDaftari;
      sum.sumOfCosts += other.cost;
    }
    vals.push(sum);
    this.estimated[type as keyof IEstimate] = vals;

  }

  depreciationOfPreOperation(year:number) {
    let PO = {
      count: 1,
      cost: this.estimated.financialSummary.preOperation,
      title: 'هزینه‌های قبل از بهره‌برداری'
    };
    this.depreciationCalculate('preOperation',year,[PO]);
  }

  depreciationOfUnforeseen(year:number) {
    let unforeseen = {
      count: 1,
      cost: (this.estimated.financialSummary.building
            + this.estimated.financialSummary.equipment
            + this.estimated.financialSummary.vehicles
            + this.estimated.financialSummary.officeEquipment
            + this.estimated.financialSummary.landscaping
            + this.estimated.financialSummary.ground) * 10/100,
      title: 'پیش‌بینی نشده'
    }
    this.depreciationCalculate('unforeseen',year,[unforeseen]);
  }

  maintenanceCost(type: string,calculate = false) {
    let estimateMaintenanceCost = (type:string) => {
      let maintenanceCost = 0
      let items = this.estimated[type as keyof IRate] as IEstehlak[]
      maintenanceCost = this.projactService.getMaintenanceCost(type, items, this.year[type])
      return maintenanceCost
    }
    
    if (calculate) { // for programmatically use
      let maintenance = {
        building: 0,
        equipment: 0,
        vehicles: 0,
      }
      let data = ['building','equipment','vehicles']

      data.forEach(item => {
        maintenance[item as keyof Imaintenance] = estimateMaintenanceCost(item)
      })

      this.estimated.maintenanceCost = maintenance

    } else { // for use in Html file
      return estimateMaintenanceCost(type)
    }

  }

  // حقوق و دستمزد
  getSalaryFormDetails(jobTitle: string, jobLevel: string) {
    let e = this.unit.salaryForm.employees.filter((item: any) => {
      return String(item.title).toLowerCase().trim() == String(jobTitle).toLowerCase().trim() &&
        String(item.level).toLowerCase().trim() == String(jobLevel).toLowerCase().trim()
    })
    e.map((ee: any) => {
      ee.cost = this.toNum(ee.cost)
      ee.count = this.toNum(ee.count)
      return ee
    })
    return e[0]
  }

  salaryFormEstimate() {
    let jobs: any[] = [];

    // get all employees order by jobLevel
    if (this.estimated.salaryBase == undefined) {
      let levels: any[] = [];
      this.unit.salaryForm.jobLevels.forEach((level: any) => {
        let e = {
          title: level.title,
          salaryBase: 1000000
        }
        levels.push(e)
      })
      this.estimated.salaryBase = levels
    }

    // get all employees order by jobTitle
    this.unit.salaryForm.jobTitles.forEach((job: any) => {
      let items = this.unit.salaryForm.employees.filter((employee: any) => {
        return String(employee.title).toLowerCase().trim() == String(job.title).toLowerCase().trim()
      })
      let e:IEmployeesCosts = {
        title: '',
        count: 0,
        cost: 0,
        eidi: 0,
        reward: 0,
        get bime() {
          return this.cost * 12 * 23 / 100
        }
      };
      items.forEach((item: any) => {
        e.title = item.title
        e.count += this.toNum(item.count)
        e.cost += this.toNum(item.cost) * this.toNum(item.count)
        e.eidi += this.reward(this.toNum(item.count), this.toNum(item.cost), item.level)
        e.reward += this.toNum(item.cost) * this.toNum(item.count) * 2
      })
      if (items.length) {
        jobs.push(e)
      }
    })

    if (jobs.length) {
      this.estimated.employees = jobs
      let sumCosts = {
        costs: 0,
        bime: 0,
        rewards: 0,
        eidi: 0,
        count: 0,
        get oneMonthLiquidityOutput() {
          return (this.bime / 12) + this.costs
        },
        get sum(){
          return (this.costs*12) + this.bime + this.eidi + this.rewards
        }
      };
      jobs.forEach((item: IEmployeesCosts) => {
        sumCosts.costs += item.cost;
        sumCosts.bime += item.bime;
        sumCosts.rewards += item.reward;
        sumCosts.eidi += item.eidi;
        sumCosts.count += item.count;
      })
      this.estimated.sumSalaryCosts = sumCosts
    }
  }

  reward(count: number, cost: number, jobLevelTitle: string) {
    let reward = 0
    let salaryBaseValue = this.estimated.salaryBase.filter((item: any) => {
      return item.title == jobLevelTitle
    })

    if (count != 0) {
      if ((cost / count) * 2 < salaryBaseValue[0].salaryBase) {
        reward = cost / count * 2 * count
      } else {
        reward = salaryBaseValue[0].salaryBase * count
      }
    }

    return reward
  }

  // سرمایه در گردش
  totalRawMaterials: number;
  netSumRawMaterials = 0;
  workingCapital(year = 1){
    let e = {
      netSumRawMaterials:0,
      totalRawMaterials: 0,
      salary: 0,
      WEGT: {
        water: 0,
        gasWarmSeasons: 0,
        gasColdSeasons: 0,
        electricity: 0,
        phoneAndInternet: 0,
        get sum(){
          return this.electricity +this.water +this.gasColdSeasons +this.gasWarmSeasons +this.phoneAndInternet
        },
      },
      bime: 0,
      maintenanceCost: 0,
      ghalebMasrafi:0,
      mojodiKala:0,
      motalebat: 0,
      tankhah: 0,
      unforeseen(sum:number){
        return sum * 5/100
      },
      sumInPeriod: 0,
      get sum(){
        return this.maintenanceCost + this.totalRawMaterials + this.ghalebMasrafi
          + this.tankhah + this.WEGT.sum + this.bime 
          // + this.salary + this.mojodiKala + this.motalebat +
      }
    }
    // mavadAvalie
    const rawMat_Calc = (totalRawMat:number,year:number) => {
      let v = (totalRawMat + (totalRawMat * this.percents.rawMaterials/100)) * 1.3;
              // * this.estimated.salesAndAdsRate.count[11-year]/this.estimated.salesAndAdsRate.count[10-year]
      if (year <= 2) {
        e.totalRawMaterials = v;
        return
      } else {
        rawMat_Calc(v,year-1)
      }
    }
    if (this.totalRawMaterials == undefined) {
      // jame khales mavad avlie
      this.unit.fundAndExpensesForm.mavadAvalie.forEach((object:any) => {
        this.netSumRawMaterials += (this.toNum(object.cost)* this.toNum(object.count) * this.toNum(object.percent))
      })
    }
    // جمع کل (مجموع مواد اولیه با پیشبینی نشده های مواد اولیه)
    e.totalRawMaterials = this.totalRawMaterials = (this.productionCapacity/12) * 
     (this.netSumRawMaterials + e.unforeseen(this.netSumRawMaterials) ) * 12
    if(this.year.workingCapital > 1) {
      rawMat_Calc(this.totalRawMaterials,this.year.workingCapital)
    } else {
      e.totalRawMaterials = this.totalRawMaterials
    }
    e.netSumRawMaterials = this.netSumRawMaterials

    // salary
    e.salary = (this.estimated.sumSalaryCosts.sum * this.profitAndLossPercents.salary_fix/100)
    const salary_Calc = (salary:number,year:number) => {
      let v = salary * 120/100;
      if (year <= 2) {
        e.salary = v;
        return;
      } else {
        salary_Calc(v,year-1);
      }
    }
    if (this.year.workingCapital > 1) {
      salary_Calc(e.salary,this.year.workingCapital)
    }

    // WEGT
    let HZ = this.unit.fundAndExpensesForm.hazineJari;
    let electricity = this.toNum(HZ.electricity.cost) * this.toNum(HZ.electricity.count);
    let gasColdSeasons = this.toNum(HZ.gasColdSeasons.cost) * this.toNum(HZ.gasColdSeasons.count);
    let gasWarmSeasons = this.toNum(HZ.gasWarmSeasons.cost) * this.toNum(HZ.gasWarmSeasons.count);
    let phoneAndInternet = this.toNum(HZ.phoneAndInternet.cost) * this.toNum(HZ.phoneAndInternet.count);
    let water = this.toNum(HZ.water.cost) * this.toNum(HZ.water.count);
    
    const WEGT_Calc = (cost:number,percent:number,variable:string,year=this.year.workingCapital) => {
      let v = cost + (cost * percent / 100)
      if (year <= 2) {
        e.WEGT[variable as keyof WEGT] = v;
        return;
      } else {
        WEGT_Calc(v,percent,variable,year-1)
      }
    }

    if (this.year.workingCapital == 1) {
      e.WEGT.electricity = electricity
      e.WEGT.gasColdSeasons = gasColdSeasons
      e.WEGT.gasWarmSeasons = gasWarmSeasons
      e.WEGT.phoneAndInternet = phoneAndInternet
      e.WEGT.water = water
    } else {
      WEGT_Calc(electricity,+HZ.electricity.percent,'electricity');
      WEGT_Calc(gasColdSeasons,+HZ.gasColdSeasons.percent,'gasColdSeasons');
      WEGT_Calc(gasWarmSeasons,+HZ.gasWarmSeasons.percent,'gasWarmSeasons');
      WEGT_Calc(phoneAndInternet,+HZ.phoneAndInternet.percent,'phoneAndInternet');
      WEGT_Calc(water,+HZ.water.percent,'water');
    }
    
    // Maintenance Costs
    e.maintenanceCost = this.estimated.maintenanceCost.building
     + this.estimated.maintenanceCost.equipment
     + this.estimated.maintenanceCost.vehicles;

    // Mojodi Kala
    let mjkl = this.toNum(this.unit.fundAndExpensesForm.mojodiKala)
    let es = (value:number,year:number) =>{
      let v = value * 1.2
      if (year <= 2) {
        e.mojodiKala = v
      } else {
        es(v, year-1)
      }
    }
    this.year.workingCapital <= 1? e.mojodiKala = mjkl :
      es(mjkl,this.year.workingCapital)

    // Motalebat
    e.motalebat = this.toNum(this.unit.fundAndExpensesForm.motalebat);

    // tankah
    if (this.year.workingCapital == 1) {
      e.tankhah = this.toNum(this.unit.fundAndExpensesForm.tankhah)
    } else {
      e.tankhah = this.toNum(this.unit.fundAndExpensesForm.tankhah) * 2
    }

    // ghalebMasrafi
    let ghmsrfi = (ghalebMasrafi:number,year:number) =>{
      let v = ghalebMasrafi + ghalebMasrafi*this.percents.ghalebMasrafi/100

      if (year <= 2) {
        e.ghalebMasrafi = v;
        return;
      } else {
        ghmsrfi(v,year-1)
      }
    }
    if (this.year.workingCapital == 1) {
      e.ghalebMasrafi = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi) * 4
    } else {
      let g = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi) * 4
      ghmsrfi(g,this.year.workingCapital)
    }

    // Sum Costs in defined Period
    e.sumInPeriod = (e.totalRawMaterials / (12/this.period))
                    + (e.salary / (12/this.period)) + (e.WEGT.sum / (12/this.period))
                    + (e.maintenanceCost / (12/this.period)) + e.mojodiKala
                    + e.motalebat + (e.ghalebMasrafi/4) + (this.year.workingCapital > 1? e.tankhah/2: e.tankhah);
    // compelete
    this.estimated.workingCapital = e;
  }

  // ضریب فروش و تبلیغات
  salesAndAdsRate(year=0){
    let e = {
      count: <Array<any>>[],
      priceIncreaseRate: [0,20,20,20,20,20,20,20,20,20],
      yearlyPrice: <Array<any>>[],
      AnnualIncome(index:number){
        return this.yearlyPrice[index] * this.count[index]
      },
      adsPercent: [1,1,1,1,1,1,1,1,1,1],
      adsCost(index:number){
        return this.adsPercent[index] * this.AnnualIncome(index)/100
      }
    }
    // yearly Price And count
    let calculate = (count:number,price:number,year:number ) => {
      let c = count * 1.3
      let yp = price * (1+e.priceIncreaseRate[10-year]/100)
      if (year-1 < 0) {
        return;
      } else {
        e.count.push(c)
        e.yearlyPrice.push(yp)
        calculate(c,yp, year-1)
      }
    }
    
    // is initialized?
    if (this.estimated.hasOwnProperty('salesAndAdsRate')) {
      e.priceIncreaseRate = this.estimated.salesAndAdsRate.priceIncreaseRate
      e.adsPercent = this.estimated.salesAndAdsRate.adsPercent
    }
    
    let count = this.toNum(this.productionCapacity)
    let yearlyPrice = this.basePrice * (1+e.priceIncreaseRate[0])

    // سال اول
    e.count.push(count);
    e.yearlyPrice.push(yearlyPrice)
    // سالهای بعدی
    calculate(count,yearlyPrice,9)

    this.estimated.salesAndAdsRate = e    
  }

  // چکیده مالی
  financialSummary(){
    let e = {
      ground: this.toNum(this.unit.investForm.ground.cost)
        *this.toNum(this.unit.investForm.ground.count),
      building: 0,
      landscaping: 0,
      equipment: 0,
      vehicles: 0,
      officeEquipment: 0,
      preOperation: 0,
      get unforeseen(){
        return (this.building +this.landscaping +this.equipment
          +this.vehicles +this.officeEquipment +this.ground) * 10/100
      },
      get sum(){
        return this.ground + this.landscaping + this.building
          + this.equipment + this.vehicles + this.officeEquipment
          + this.preOperation + this.unforeseen
      },
      totalCapitalRequired: 0
    }

    // building
    this.unit.investForm.building.forEach((item:{count:string,cost:string}) => {
      e.building += this.toNum(item.cost) * this.toNum(item.count)
    })

    // landscaping
    this.unit.investForm.landscaping.forEach((item:{count:string,cost:string}) => {
      e.landscaping += this.toNum(item.cost) * this.toNum(item.count)
    })

    // equipment
    this.unit.investForm.equipment.forEach((item:{count:string,cost:string}) => {
      e.equipment += this.toNum(item.cost) * this.toNum(item.count)
    })

    // vehicles
    this.unit.investForm.vehicles.forEach((item:{count:string,cost:string}) => {
      e.vehicles += this.toNum(item.cost) * this.toNum(item.count)
    }) 

    // officeEquipment
    let OF = 0
    this.unit.investForm.officeEquipment.forEach((item:{count:string,cost:string}) => {
      e.officeEquipment += this.toNum(item.cost) * this.toNum(item.count)
    })
    e.officeEquipment += e.officeEquipment * 5/100

    // preOperation
    let PO = this.unit.investForm.preOperation
    let sumYearlySalary = 0;
    this.estimated.employees.forEach((item: {cost:number}) => {
      sumYearlySalary += item.cost * 12
    })
    PO.staffTraining = sumYearlySalary * 2/100
    PO.tolidAzmayeshi = (this.estimated.workingCapital.WEGT.sum+this.estimated.workingCapital.totalRawMaterials) / this.period / (30/15)
    
    e.preOperation = this.toNum(PO.otherCosts1) +this.toNum(PO.otherCosts2) +this.toNum(PO.otherCosts3)
      +this.toNum(PO.otherCosts4) +this.toNum(PO.otherCosts5) +this.toNum(PO.research)
      +this.toNum(PO.staffTraining) +this.toNum(PO.tolidAzmayeshi)
    
    // totalCapitalRequired
    e.totalCapitalRequired = e.sum + this.estimated.workingCapital.sumInPeriod

    this.estimated.financialSummary = e;

  }

  // تسهیلات بانکی
  bankFacilities(){
    let e = {
      PMT: 0,
      bankLoan: this.estimated.financialSummary.totalCapitalRequired * this.percents.bankLoansFromTotalCapital/100,
      fullRefund: 0,
      get totalInterest(){
        return this.fullRefund - this.bankLoan
      }
    }
    e.PMT = -this.projactService.PMT((this.percents.bankInterestRate/100)/12,this.percents.installmentCount-this.tanafos,e.bankLoan);
    e.fullRefund = this.percents.installmentCount * e.PMT;

    this.estimated.bankFacilities = e

    // اقساط
    let q:any = {
      installment: this.estimated.bankFacilities.PMT,
      principal: <any>[],
      interest: <any>[],
      remaining: <any>[],
    }
    // Interest & Principal
    let firstInstallmentInterest = (this.percents.bankInterestRate/100)/12 * this.estimated.bankFacilities.bankLoan;
    let firstInstallmentPrincipal = q.installment - firstInstallmentInterest
    
    this.principalAndInterest(firstInstallmentInterest,
      firstInstallmentPrincipal,
      this.percents.installmentCount-1,
      q);

    // Remaining

    let firstRemaining = this.estimated.bankFacilities.bankLoan - firstInstallmentPrincipal
    const remainingCalculate = (remaining:number,IN:number) => {
      let v = remaining - q.principal[this.percents.installmentCount-IN+1]      

      if (IN-1 < 0 ) {
        return
      } else {
        if (v) {
          q.remaining.push(v)
        } else {
          q.remaining.push('0')
        }
        remainingCalculate(v,IN-1)
      }
    }

    q.remaining.push(firstRemaining)
    remainingCalculate(firstRemaining,this.percents.installmentCount)

    // years of installments. to add new row in lastest table
    if (q.hasOwnProperty('year') && q.years.length) {
      let newLength = Math.ceil(q.principal.length/12) + 1
      if (newLength > q.years.length) {
        q.years.push('1')
      } else if (newLength < q.years.length) {
        (<Array<any>>q.years).pop()
      }
    } else {
      let num = Math.ceil(q.principal.length/12) + 1
      q.years = new Array(num)
    }

    this.estimated.bankFacilities.installments = q;
  }

  principalAndInterest(interest:number,principal:number,INCount:number,Obj:any):any{
    let interestList:any[] = []
    let principalList:any[] = []
    principalList.push(principal);
    interestList.push(interest);

    const calculate = (principal:number,IN:number) => {
      let newPrincipal = principal * (1 + (this.percents.bankInterestRate/100)/12);
      let newInterest = this.estimated.bankFacilities.PMT - newPrincipal;

      if (IN-1 < 0 ) {
        Obj.principal = principalList;
        Obj.interest = interestList;
        return
      } else {
        interestList.push(newInterest);
        principalList.push(newPrincipal);
        calculate(newPrincipal,IN-1)
      }
      
    }

    calculate(principal,INCount)
  }

  // هزینه های تولید سالانه
  annualProductionCost:any;
  annualProductionCosts(){
    let e = {
      maintenanceCost: this.estimated.workingCapital.maintenanceCost,
      totalRawMaterials: this.estimated.workingCapital.totalRawMaterials,
      salary: 0,
      WEGT: this.estimated.workingCapital.WEGT.sum,
      get unforeseen() {
        return (this.maintenanceCost+this.totalRawMaterials+this.salary+this.WEGT) * 5/100;
      },
      get administrativeAndSellingExpenses() {
        return (this.maintenanceCost+this.totalRawMaterials+this.salary+this.WEGT+this.unforeseen) * 1/100;
      },
      bankFacilityCosts: 0,
      depreciationCosts: 0,
      preOperationDepreciationCosts: 0,
      ghalebMasrafi: 0,
      bime: 0,
      get sum() {
        return this.WEGT + this.maintenanceCost + this.totalRawMaterials + this.salary 
        + this.unforeseen + this.administrativeAndSellingExpenses + this.bime
        + this.depreciationCosts + this.preOperationDepreciationCosts + this.ghalebMasrafi
        + this.bankFacilityCosts
      }
    }

    // salary
    e.salary = this.estimated.sumSalaryCosts.sum
    const salary_Calc = (value:number,year:number) => {
      let v = value * (100 + this.percents.salary)/100
      if (year <= 2) {
        e.salary = v;
        return;
      } else {
        salary_Calc(v,year-1)
      }
    }
    if (this.year.annualPC > 1)
      salary_Calc(e.salary,this.year.annualPC);
    
    // bankFacilityCosts
    e.bankFacilityCosts = this.percents.installmentCount > (this.year.annualPC-1)*12 ?
                          this.getSumOfArrays(this.estimated.bankFacilities.installments.interest,(this.year.annualPC-1)*12):
                          0;

    // depreciationCosts
    // بدلیل اینکه این محاسبات وابسته به محاسبات کلی دیگر بودند  در داخل این تابع محاسبه نمودم
    // let PO = {
    //   count: 1,
    //   cost: this.estimated.financialSummary.preOperation,
    //   title: 'هزینه‌های قبل از بهره‌برداری'
    // };
    // this.depreciationCalculate('preOperation',this.year.annualPC,[PO]);
    // let unforeseen = {
    //   count: 1,
    //   cost: (this.estimated.financialSummary.building
    //         + this.estimated.financialSummary.equipment
    //         + this.estimated.financialSummary.vehicles
    //         + this.estimated.financialSummary.officeEquipment
    //         + this.estimated.financialSummary.landscaping
    //         + this.estimated.financialSummary.ground) * 10/100,
    //   title: 'پیش‌بینی نشده'
    // }
    // this.depreciationCalculate('unforeseen',this.year.annualPC,[unforeseen]);
    this.depreciationOfPreOperation(this.year.annualPC);
    this.depreciationOfUnforeseen(this.year.annualPC);

    e.depreciationCosts = this.estimated.building[this.estimated.building.length-1].estehlak
                          + this.estimated.equipment[this.estimated.equipment.length-1].estehlak
                          + this.estimated.officeEquipment[this.estimated.officeEquipment.length-1].estehlak
                          + this.estimated.vehicles[this.estimated.vehicles.length-1].estehlak
                          + this.estimated.unforeseen[this.estimated.unforeseen.length-1].estehlak;
    if (this.year.annualPC > 1)
      e.depreciationCosts += this.estimated.preOperation[this.estimated.preOperation.length-1].estehlak;

    // preOperationDepreciationCosts
    e.preOperationDepreciationCosts = this.estimated.preOperation[this.estimated.preOperation.length-1].estehlak

    // ghalebMasrafi
    let ghmsrfi = (ghalebMasrafi:number,year:number) =>{
      let v = ghalebMasrafi + (ghalebMasrafi*this.percents.ghalebMasrafi/100)

      if (year <= 2) {
        e.ghalebMasrafi = v;
        return;
      } else {
        ghmsrfi(v,year-1)
      }
    }
    if (this.year.annualPC == 1) {
      e.ghalebMasrafi = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi) * 4
    } else {
      let g = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi) * 4
      ghmsrfi(g,this.year.annualPC)
    }

    // bime
    this.bime(e,this.year.annualPC);

    // compelete
    this.annualProductionCost = e;
    this.estimated.annualProductionCosts = e;

  }

  bime(object:any,objYear:number) {
    let firstYearBime = this.estimated.financialSummary.sum * 0.002

    const calculate = (bime:number,year:number) => {
      let v = bime * 1.1;
      if (year <=2 ) {
        object.bime = v;
        return;
      } else {
        calculate(v,year-1);
      }
    }

    if (objYear == 1) {
      object.bime = firstYearBime;
    } else {
      calculate(firstYearBime,objYear);
    }
  }
  // Events

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

  focus(e:Event){
    let elm = (<HTMLElement>e.target)
    if (elm.clientWidth < 50)
      elm.parentElement?.setAttribute('colspan','3') 
  }

  parametersChanged() {
    this.projactService.percents = this.percents;
    this.projactService.profitAndLossPercents = this.profitAndLossPercents;
    this.projactService.rate = this.rate;
    // this.projactService.net = this.net;
    // this.projactService.maintenance = this.maintenance
    this.projactService.productionCapacity = this.productionCapacity;
    this.projactService.period = this.period;
    this.projactService.tanafos = this.tanafos;
    this.projactService.basePrice = this.basePrice;
  }

  focusOut(e:Event){
    let elm = (<HTMLElement>e.target)
    elm.parentElement?.setAttribute('colspan','1')
  }

  orderbyValueAsc = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return a.key > b.key ? -1 : (a.key > b.key) ? 0 : 1
  }

  toNum(x:any){
    return this.projactService.justNum(x)
  }
}

export interface IHasDepreciation {
  landscaping: IEstehlak[];
  equipment: IEstehlak[];
  vehicles: IEstehlak[];
  officeEquipment: IEstehlak[];
}
export class Imaintenance {
  building: 'building';
  equipment: 'equipment';
  vehicles: 'vehicles';
}
export interface IEmployeesCosts {
  title: string,
  count: number,
  cost: number,
  eidi: number,
  reward: number,
  bime: number,
}
export interface WEGT{
  water: number,
  gasWarmSeasons: number,
  gasColdSeasons: number,
  electricity: number,
  phoneAndInternet: number,
}
export class actions {
  workingCapital: number = 4
}
export class DoActon {
  action:string;
  year:number;
}