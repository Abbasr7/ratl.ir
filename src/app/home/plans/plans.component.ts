import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { Product, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { CartService } from 'src/app/controlers/services/cart.service';
import { ServerService } from 'src/app/controlers/services/server.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {

  constructor(private server:ServerService,private cart:CartService,
    private router:Router) { }

  data:Product = new Product;

  ngOnInit(): void {

    this.server.get('/plan/getplans').pipe(
      map(i => i as SuccessHandle)
    ).subscribe(res => {
      this.data = res.data[0]
    })
  
  }

  toPrice(id:string){
    this.cart.toPrice(id)
    this.router.navigate(['cart/'+id])
  }
  addToCart(id:string){
    this.cart.addToCartProduct(id)
    console.log(id,this.cart.getItems());
  }
  
  assigndata(res?:any){
    this.data = res
    return this.data
  }
}
