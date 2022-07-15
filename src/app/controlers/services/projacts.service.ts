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
    let maintenanceCost = 0
    let sum = list[list.length-1]

    let firstYearMaintenanceCost = sum.sumOfCosts * this.maintenance[type as keyof IRate]/100
    const calculate = (firstYearMaintenanceCost:number,year:number) => {
      let mCost = firstYearMaintenanceCost + this.net[type as keyof IRate]/100 * firstYearMaintenanceCost
      if (year != 0) {
        calculate(mCost,year-1)
      } else {
        maintenanceCost = Math.round(mCost)
      }
    }
    if (year == 1) {
      return firstYearMaintenanceCost
    } else {
      calculate(firstYearMaintenanceCost,year)
      return maintenanceCost
    }
  }

  justNum(x: any) {
    let xx = x.toString()
    return +xx.replace(/\D/g, "")
  }

}
