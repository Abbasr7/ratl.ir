import { KeyValue } from '@angular/common';
import { Component, DoCheck, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, map, take } from 'rxjs';
import { IEstehlak, IEstimate, IProjact, IRate, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { ServerService } from 'src/app/controlers/services/server.service';

@Component({
  selector: 'app-estimate',
  templateUrl: './estimate.component.html',
  styleUrls: ['./estimate.component.css']
})
export class EstimateComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public projactService: ProjactsService,
    public server: ServerService
  ) { }

  unit: IProjact = new IProjact
  unit_id = this.route.snapshot.paramMap.get('id')
  rate = this.projactService.rate
  estimated = new IEstimate;
  year:any = {
    building: 1,
    equipment: 1,
    vehicles: 1,
    officeEquipment: 1,
    preOperation: 1,
    pishbiniNashode: 1,
    workingCapital: 1,
    salesAndAdsRate: 1,
    bankFacilities: 1,
  };
  profitAndLoss:any;

  percents = this.projactService.percents

  money:string;
  period: number;
  ngOnInit(): void {

    this.unit = this.projactService.projact.value

    if (this.unit_id && !this.unit._id) {
      this.getCurrentUnit()
    } else if (this.unit._id) {
      this.toEstimate()
    }

  }

  private getCurrentUnit() {
    let data;
    (async () => {
      this.unit = await lastValueFrom(this.projactService.getById(this.unit_id!).pipe(
        map(res => res as SuccessHandle),
        map(res => res.data as IProjact),
      ))
      this.period = this.toNum(this.unit.fundAndExpensesForm.time)
      this.toEstimate()
      
      console.log(this.unit,this.estimated);
    })()
  }

  toEstimate() {
    this.depreciationCalculate('equipment', this.year.equipment)
    this.depreciationCalculate('building', this.year.building)
    this.depreciationCalculate('vehicles', this.year.vehicles)
    this.depreciationCalculate('officeEquipment', this.year.officeEquipment);
    this.maintenanceCost('any',true)

    this.salaryFormEstimate()

    this.getWorkingCapital()
    this.salesAndAdsRate()

    this.financialSummary()

    this.bankFacilities()

  }

  depreciationCalculate(type: string, year: number) {
    let sum = {
      title: 'مجموع',
      estehlak: 0,
      arzeshDaftari: 0,
      sumOfCosts: 0,
    }
    let vals: any = []
    this.unit.investForm[type as keyof IHasDepreciation].forEach((item: any) => {
      let getEstehlak = this.projactService.estehlakHarSal(type, item, year)
      sum.estehlak += getEstehlak.estehlak
      sum.arzeshDaftari += getEstehlak.arzeshDaftari
      sum.sumOfCosts += this.toNum(item.count) * this.toNum(item.cost)
      vals.push(getEstehlak)
    })
    vals.push(sum);
    this.estimated[type as keyof IEstimate] = vals;

  }

  maintenanceCost(type: string,calculate = false) {
    let estimateMaintenanceCost = (type:string) => {
      let maintenanceCost = 0
      let items = this.estimated[type as keyof IRate] as IEstehlak[]
      maintenanceCost = this.projactService.getMaintenanceCost(type, items, this.year[type])
      return maintenanceCost
    }
    
    if (calculate) { // for programmerly use
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
        sumCosts.eidi += item.eidi
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
  getWorkingCapital(year = 1){
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
      get sum(){
        return this.totalRawMaterials + this.salary + this.WEGT.sum +
         this.maintenanceCost + this.mojodiKala + this.motalebat +
          this.ghalebMasrafi + this.tankhah
      }
    }
    // mavadAvalie
    const rawMat_Calc = (totalRawMat:number,year:number) => {
      let v = (totalRawMat + (totalRawMat * this.percents.rawMaterials/100))
              * this.estimated.salesAndAdsRate.count[11-year]/this.estimated.salesAndAdsRate.count[10-year]
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
      // جمع کل (مجموع مواد اولیه با پیشبینی نشده های مواد اولیه)
      this.totalRawMaterials = e.totalRawMaterials = (this.toNum(this.unit.fundAndExpensesForm.zarfiyateSalane)/12) * 
       (this.netSumRawMaterials + e.unforeseen(this.netSumRawMaterials) ) *
       this.toNum(this.unit.fundAndExpensesForm.time)
    }
    if(this.year.workingCapital != 1) {
      rawMat_Calc(this.totalRawMaterials,this.year.workingCapital)
    } else {
      e.totalRawMaterials = this.totalRawMaterials
    }
    e.netSumRawMaterials = this.netSumRawMaterials

    // salary
    e.salary = (this.estimated.sumSalaryCosts.sum * this.percents.salary/100) * 12/(this.toNum(this.unit.fundAndExpensesForm.time))
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
    // if (this.year.workingCapital <= 1)
    e.tankhah = this.toNum(this.unit.fundAndExpensesForm.tankhah)

    // ghalebMasrafi
    let ghmsrfi = (ghalebMasrafi:number,year:number) =>{
      let v = ghalebMasrafi + ghalebMasrafi*this.percents.ghalebMasrafi/100

      if (year <= 1) {
        e.ghalebMasrafi = v;
        return;
      } else {
        ghmsrfi(v,year-1)
      }
    }
    if (this.year.workingCapital == 1) {
      e.ghalebMasrafi = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi)
    } else {
      ghmsrfi(this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi),this.year.workingCapital)
    }
    // compelete
    this.estimated.workingCapital = e;
  }

  // ضریب فروش و تبلیغات
  salesAndAdsRate(year=0){
    let e = {
      count: <Array<any>>[],
      basePrice: 1,
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
      e.basePrice = this.estimated.salesAndAdsRate.basePrice
      e.adsPercent = this.estimated.salesAndAdsRate.adsPercent
    }
    
    let count = this.toNum(this.unit.fundAndExpensesForm.zarfiyateSalane)
    let yearlyPrice = this.toNum(e.basePrice) * (1+e.priceIncreaseRate[0])

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
    PO.tolidAzmayeshi = (this.estimated.workingCapital.WEGT.sum+this.estimated.workingCapital.totalRawMaterials) / this.toNum(this.unit.fundAndExpensesForm.time) / (30/15)
    
    e.preOperation = this.toNum(PO.otherCosts1) +this.toNum(PO.otherCosts2) +this.toNum(PO.otherCosts3)
      +this.toNum(PO.otherCosts4) +this.toNum(PO.otherCosts5) +this.toNum(PO.research)
      +this.toNum(PO.staffTraining) +this.toNum(PO.tolidAzmayeshi)
    
    // totalCapitalRequired
    e.totalCapitalRequired = e.sum + this.estimated.workingCapital.sum

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
    e.PMT = -this.projactService.PMT((this.percents.bankInterestRate/100)/12,this.percents.installmentCount,e.bankLoan);
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
    interestList.push(interest);
    principalList.push(principal);

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

  // Events

  focus(e:Event){
    let elm = (<HTMLElement>e.target)
    if (elm.clientWidth < 50)
      elm.parentElement?.setAttribute('colspan','3') 
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