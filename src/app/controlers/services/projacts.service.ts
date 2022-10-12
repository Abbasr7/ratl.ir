import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, map, Subject } from 'rxjs';
import { Globals } from 'src/app/globals';
import { IEstehlak, IEstimate, IProjact, IRate, SuccessHandle } from '../interfaces/interfaces';
import { Parameters } from '../interfaces/params';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class ProjactsService {

  constructor(private server:ServerService) { }

  setUnit = new BehaviorSubject(new IProjact);
  setChanges = new BehaviorSubject(new IEstimate);
  projactsApi = Globals.projactsApi
  projact = new BehaviorSubject(new IProjact());
  parametersId = new BehaviorSubject('');

  net = {
    building: 1, // %
    equipment: 15, // %
    vehicles: 5, // %
    officeEquipment: 0, // %
    preOperation: 0, // %
    unforeseen: 0 // %
  }
  rate: IRate = {
    building: 7, // %
    equipment: 8, // %
    vehicles: 25, // %
    officeEquipment: 10, // %
    preOperation: 20, // %
    unforeseen: 10, // %
  }
  maintenance = {
    building: 2, // %
    equipment: 5, // %
    vehicles: 10, // %
    officeEquipment: 0, // %
    preOperation: 0, // %
    unforeseen: 0 // %
  }
  percents = {
    salary: 0,
    ghalebMasrafi: 0,
    fixedCapital: 30,
    workingCapital: 30,
    bankLoansFromTotalCapital: 50,
    bankInterestRate: 4,
    installmentCount: 60,
    rawMaterials: 0,
  }
  profitAndLossPercents = {
    deprication: 100,
    salary_var: 35,
    salary_fix: 65,
    rawMaterials_var: 100,
    maintenance_var: 80,
    maintenance_fix: 20,
    administrativeAndSelling_var: 100,
    unforeseen_var: 85,
    unforeseen_fix: 15,
    WEGT_var: 80,
    WEGT_fix: 20,
    Ads_var: 0,
    preOperation_fix: 100,
    workingCapital_fix: 0,
    BFInterest_fix: 100,
    bime_fix: 100,
  }
  period: number;
  productionCapacity: number;
  basePrice = new BehaviorSubject(1);
  callGetIRR = new BehaviorSubject(false);
  callGetNPV:BehaviorSubject<any> = new BehaviorSubject(false);


  newProjact(data:{}){
    return this.server.create(this.projactsApi.create,data)
  }

  update(id:string,data:{}){
    return this.server.update(this.projactsApi.edit+id,data)
  }

  delete(id:string){
    return this.server.delete(this.projactsApi.delete+id);
  }

  getById(id:String){
    return this.server.get(this.projactsApi.details+id)
  }

  getAllUserProjacts(){
    return this.server.get(this.projactsApi.getAll)
  }

  getCahnges(){
    return this.setChanges.asObservable();
  }

  getUnit() {
    return this.setUnit.asObservable();
  }

  getParams(projectId:string) {
    return this.server.get(Globals.paramsApi.details+projectId).pipe(
      map(res => res as SuccessHandle)
    );
  }

  setParams(params:Parameters) {
    this.percents = params.percents;
    this.profitAndLossPercents = params.profitAndLossPercents;
    this.rate = params.rate;
    this.net = params.net;
    this.maintenance = params.maintenance;
    this.period = params.period;
    this.productionCapacity = params.productionCapacity;
    this.basePrice.next(params.basePrice);
  }

  saveParams(id:string,params?:any) {
    let parameters:any = {
      rate: this.rate,
      net: this.net,
      percents: this.percents,
      profitAndLossPercents: this.profitAndLossPercents,
      maintenance: this.maintenance,
      basePrice: this.basePrice.value,
      period: this.period,
      productionCapacity: this.productionCapacity
    }
    console.log(parameters);

    this.setParams(parameters);
    return this.server.update(Globals.paramsApi.edit+id,parameters);
  }

  estehlakHarSal(type: any, item: any, year: number): IEstehlak {
    let value = item
    let data: any;

    const calculate = (arzeshDaftari: number, years: number) => {
      let e = {
        title: item.title,
        year: year - years,
        estehlak: Math.round(arzeshDaftari * this.rate[type as keyof IRate] / 100),
        get arzeshDaftari() {
          return arzeshDaftari - this.estehlak
        }
      }
      if (years != 0) {
        calculate(e.arzeshDaftari, years - 1)
      } else {
        data = e
      }
    };

    let totalCost = this.justNum(value.count) * this.justNum(value.cost)
    calculate(totalCost, year - 1)

    return data;
  }

  getMaintenanceCost(type: string,list:IEstehlak[],year:number) {
    let MaintenanceCost = 0;
    let sum = list[list.length-1];
    let firstYearMaintenanceCost = sum.sumOfCosts * this.maintenance[type as keyof IRate]/100;

    const calculate = (maintenanceCost:number,year:number) => {
      let mCost = maintenanceCost + this.net[type as keyof IRate]/100 * maintenanceCost
      if (year <= 2) {
        MaintenanceCost = Math.round(mCost)
      } else {
        calculate(mCost,year-1)
      }
    }

    if (year == 1) {
      return firstYearMaintenanceCost
    } else {
      calculate(firstYearMaintenanceCost,year)
      return MaintenanceCost
    }
  }

  PMT(rate:number, nper:number, pv:number, fv:number=0, type:number=0) {
    /*
     * rate   - interest rate per month
     * nper   - number of periods (months)
     * pv   - present value
     * fv   - future value
     * type - when the payments are due:
     *        0: end of the period, e.g. end of month (default)
     *        1: beginning of period
     */
    let pmt, pvif;

    fv || (fv = 0);
    type || (type = 0);

    if (rate === 0)
      return -(pv + fv) / nper;

    pvif = Math.pow(1 + rate, nper);
    pmt = - rate * (pv * pvif + fv) / (pvif - 1);

    if (type === 1)
      pmt /= (1 + rate);

    return pmt;
  }

  justNum(x: any) {
    let xx;
    if (typeof x == 'number') {
      xx = Math.round(x).toString()
    } else {
      xx = x.toString()
    }
    return +xx.replace(/\D/g, "")
  }

}
