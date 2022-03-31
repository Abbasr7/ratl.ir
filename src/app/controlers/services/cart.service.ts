import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../interfaces/interfaces';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private server:ServerService) { }

  public products:Product[] = []
  private items:any[] = []
  private plan:string

  toPrice(id:string){
    this.plan = id
    sessionStorage.setItem('cart',this.plan)
  }
  addToCartProduct(id:string){
    let exist = 0
    let item:any = {
      _id:id,
      count:0
    }
    if (this.items.length) {
      let result = this.items.find( ({_id}) => _id == id)
      if (result) {
          result.count++
          return
        } else {
          exist = 1
          this.items.push(item)
        }
    }
    this.items.push(item)
  }

  getItems(){
    return this.items
  }

  clearCart(){
    this.items = []
  }

  checkOut(planId:string,user:string){

    let args = {
      planid:planId,
      user:user,
    }
    return this.server.create('/pay/checkout',args)

  }
}
