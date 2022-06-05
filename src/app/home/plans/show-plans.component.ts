import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map} from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { CartService } from 'src/app/controlers/services/cart.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-show-plans',
  templateUrl: './show-plans.component.html',
  styleUrls: ['./show-plans.component.css']
})
export class ShowPlansComponent implements OnInit {

  constructor(private server:ServerService,private cart:CartService,
    private router:Router) { }

  data:any;
  grid = false;

  ngOnInit(): void {

    this.data = this.server.get('/plan/getall').pipe(
      map(i => i as SuccessHandle),
      map(i => i.data)
    )
  
  }

  toPrice(id:string){
    this.cart.toPrice(id)
    this.router.navigate(['cart/'+id])
  }
  addToCart(id:string){
    this.cart.addToCartProduct(id)
  }

}
