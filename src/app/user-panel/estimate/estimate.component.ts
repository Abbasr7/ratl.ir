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
    salesAndAdsRate: 1
  };
  profitAndLoss:any;

  percents = this.projactService.percents

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
    
    if (calculate) {
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
    } else {
      
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
  getWorkingCapital(year = 1){
    let e = {
      mavadAvalie: 0,
      sumMavadAvalie:0,
      salary: 0,
      WEGT: 0,
      maintenanceCost: 0,
      ghalebMasrafi:0,
      mojodiKala:0,
      motalebat: 0,
      tankhah: 0,
      unforeseen(sum:number){
        return sum * 5/100
      },
      get sum(){
        return this.mavadAvalie + this.salary + this.WEGT +
         this.maintenanceCost + this.mojodiKala + this.motalebat +
          this.ghalebMasrafi + this.tankhah
      }
    }
    // mavadAvalie
    let sumMavadAvalie = 0;
    this.unit.fundAndExpensesForm.mavadAvalie.forEach((object:any) => {
      sumMavadAvalie += (this.toNum(object.cost)* this.toNum(object.count) * this.toNum(object.percent))
    })
    e.mavadAvalie = (this.toNum(this.unit.fundAndExpensesForm.zarfiyateSalane)/12) * 
     (sumMavadAvalie + e.unforeseen(sumMavadAvalie) ) *
     this.toNum(this.unit.fundAndExpensesForm.time)
    // sum mavad avlie
    e.sumMavadAvalie = sumMavadAvalie

    // salary
    e.salary = (this.estimated.sumSalaryCosts.sum * this.percents.salary/100) * 12/(this.toNum(this.unit.fundAndExpensesForm.time))

    // WEGT
    e.WEGT = (
       this.toNum(this.unit.fundAndExpensesForm.hazineJari.electricity.cost) * this.toNum(this.unit.fundAndExpensesForm.hazineJari.electricity.count)
     + this.toNum(this.unit.fundAndExpensesForm.hazineJari.gasColdSeasons.cost) * this.toNum(this.unit.fundAndExpensesForm.hazineJari.gasColdSeasons.count)
     + this.toNum(this.unit.fundAndExpensesForm.hazineJari.gasWarmSeasons.cost) * this.toNum(this.unit.fundAndExpensesForm.hazineJari.gasWarmSeasons.count)
     + this.toNum(this.unit.fundAndExpensesForm.hazineJari.phoneAndInternet.cost) * this.toNum(this.unit.fundAndExpensesForm.hazineJari.phoneAndInternet.count)
     + this.toNum(this.unit.fundAndExpensesForm.hazineJari.water.cost) * this.toNum(this.unit.fundAndExpensesForm.hazineJari.water.count)
    )
     * 12/this.toNum(this.unit.fundAndExpensesForm.time);

    // Maintenance Costs
    e.maintenanceCost = this.estimated.maintenanceCost.building
     + this.estimated.maintenanceCost.equipment
     + this.estimated.maintenanceCost.vehicles;

    // Mojodi Kala
    (() => {
      let mjkl = this.toNum(this.unit.fundAndExpensesForm.mojodiKala)
      let es = (value:number,year:number) =>{
        let v = value * 1.2
        if (year-1 <= 0) {
          e.mojodiKala = v
        } else {
          es(v, year-1)
        }
      }
      this.year.workingCapital <= 1? e.mojodiKala = mjkl :
        es(mjkl,this.year.workingCapital)
    })()

    // Motalebat
    e.motalebat = this.toNum(this.unit.fundAndExpensesForm.motalebat);

    // tankah
    if (this.year.workingCapital <= 1)
      e.tankhah = this.toNum(this.unit.fundAndExpensesForm.tankhah)

    // ghalebMasrafi
    let ghmsrfi = (ghalebMasrafi:number,year:number) =>{
      let v = this.toNum(ghalebMasrafi) + (this.toNum(ghalebMasrafi)*this.percents.ghalebMasrafi/100)
      if (year-1 <= 0) {
        e.ghalebMasrafi = this.toNum(v)
      } else {
        ghmsrfi(v,year-1)
      }
    }
    if (this.year.workingCapital == 1) {
      e.ghalebMasrafi = this.toNum(this.unit.fundAndExpensesForm.ghalebMasrafi)
    } else {
      ghmsrfi(this.unit.fundAndExpensesForm.ghalebMasrafi,this.year.workingCapital)
    }
    // compelete
    this.estimated.workingCapital = e;


  }

  // ضریب فروش و تبلیغات
  salesAndAdsRate(){
    let e = {
      count: 0,
      basePrice: 1,
      priceIncreaseRate: 0,
      yearlyPrice: 0,
      get AnnualIncome(){
        return this.yearlyPrice * this.count
      },
      adsPercent: 1,
      get adsCost(){
        return this.adsPercent * this.AnnualIncome/100
      }
    }
    // yearly Price And count
    let calculate = (count:number,price:number,year:number ) => {
      let c = count * 1.3
      let yp = price * (1+e.priceIncreaseRate/100)
      if (year-1 <= 0) {
        e.count = c
        e.yearlyPrice = yp
      } else {
        calculate(c,yp, year-1)
      }
    }
    
    // is initialized?
    if (this.estimated.hasOwnProperty('salesAndAdsRate')) {
      e.priceIncreaseRate = this.estimated.salesAndAdsRate.priceIncreaseRate
      e.basePrice = this.estimated.salesAndAdsRate.basePrice
      e.adsPercent = this.estimated.salesAndAdsRate.adsPercent
    }
    
    e.count = this.toNum(this.unit.fundAndExpensesForm.zarfiyateSalane)
    e.yearlyPrice = this.toNum(e.basePrice) * (1+e.priceIncreaseRate)
    if (this.year.salesAndAdsRate != 1) {
      e.priceIncreaseRate = 20
      calculate(e.count,e.yearlyPrice,this.year.salesAndAdsRate)
    }    

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
      }
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
    PO.tolidAzmayeshi = (this.estimated.workingCapital.WEGT+this.estimated.workingCapital.mavadAvalie)
                        / this.toNum(this.unit.fundAndExpensesForm.time) / (30/15)

    e.preOperation = this.toNum(PO.otherCosts1) +this.toNum(PO.otherCosts2) +this.toNum(PO.otherCosts3)
      +this.toNum(PO.otherCosts4) +this.toNum(PO.otherCosts5) +this.toNum(PO.research)
      +this.toNum(PO.staffTraining) +this.toNum(PO.tolidAzmayeshi)

    this.estimated.financialSummary = e;

  }

  // تسهیلات بانکی
  bankFacilities(){

  }
  
  // Events
  focus(e:Event){
    console.log(e);
    let elm = (<HTMLElement>e.target)
    if (elm.clientWidth < 50)
      elm.parentElement?.setAttribute('colspan','3')
    
  }
  focusOut(e:Event){
    let elm = (<HTMLElement>e.target)
    elm.parentElement?.setAttribute('colspan','1')
  }
  rateChanged(event: Event, type: any) {
    this.rate[type as keyof IRate] = (<HTMLInputElement>event.target).valueAsNumber
    this.depreciationCalculate(type, this.year[type as keyof IRate])
  }

  changeYear(event: Event, type: string) {
    this.depreciationCalculate(type, this.year[type as keyof IRate])
  }

  rateValue(type: any) {
    return this.rate[type as keyof IRate]
  }

  orderbyValueAsc = (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
    return a.key > b.key ? -1 : (a.key > b.key) ? 0 : 1
  }
  SAInputsChange(event:Event){
    this.salesAndAdsRate()
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
