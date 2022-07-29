import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Globals } from 'src/app/globals';
import { IEstehlak, IProjact, IRate } from '../interfaces/interfaces';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class ProjactsService {

  constructor(private server:ServerService) { }

  projactsApi = Globals.projactsApi
  projact = new BehaviorSubject(new IProjact());
  net = {
    building: 1, // %
    equipment: 15, // %
    vehicles: 5, // %
    officeEquipment: 0, // %
    preOperation: 0, // %
    pishbiniNashode: 0 // %
  }
  rate: IRate = {
    building: 7, // %
    equipment: 8, // %
    vehicles: 25, // %
    officeEquipment: 10, // %
    preOperation: 20, // %
    pishbiniNashode: 10, // %
  }
  maintenance = {
    building: 2, // %
    equipment: 5, // %
    vehicles: 10, // %
    officeEquipment: 0, // %
    preOperation: 0, // %
    pishbiniNashode: 0 // %
  }
  percents = {
    salary: 65,
    ghalebMasrafi: 1,
    fixedCapital: 30,
    workingCapital: 30,
    bankLoansFromTotalCapital: 50,
    bankInterestRate: 4,
    installmentCount: 60,
    rawMaterials: 0,
  }
  newProjact(data:{}){
    return this.server.create(this.projactsApi.create,data)
  }

  update(id:string,data:{}){
    return this.server.update(this.projactsApi.edit+id,data)
  }

  getById(id:String){
    return this.server.get(this.projactsApi.details+id)
  }

  getAllUserProjacts(){
    return this.server.get(this.projactsApi.getAll)
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
    let MaintenanceCost = 0
    let sum = list[list.length-1]

    let firstYearMaintenanceCost = sum.sumOfCosts * this.maintenance[type as keyof IRate]/100
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
