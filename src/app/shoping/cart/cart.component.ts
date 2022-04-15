import { Component, OnInit,OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { activePlans, Product, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { AuthService } from 'src/app/controlers/services/auth.service';
import { CartService } from 'src/app/controlers/services/cart.service';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit,OnDestroy {

  constructor(
    private auth:AuthService,
    private server:ServerService,
    private cart:CartService,
    private route:ActivatedRoute,
    private user:UserService,
    private msg:MessagesService,
    private spinner:Spinner,
    private router:Router) { }

  subscribtion:Subscription
  subscribtion2:Subscription
  loggedin:any;
  data:Product = new Product
  items:any;
  planId:string|null;
  submitted:boolean = false

  async ngOnInit() {

    this.loggedin = await this.auth.isLoggedIn()
    this.items = this.cart.getItems()
    
    this.planId = this.route.snapshot.paramMap.get('id')

    this.subscribtion = this.server.get('/plan/plandetails?id='+this.planId).pipe(
      map(i => i as SuccessHandle)
    ).subscribe(res => {
      this.data = res.data
    })

  }

  toPrice(){
    this.spinner.addSpinner('#btn1')
    this.submitted = true
    if (!this.loggedin[0]) {
      this.msg.sendMessage(this.loggedin[2],'warning')
      this.spinner.removeSpinner('#btn1')
      return
    }

    this.subscribtion2 = this.cart.checkOut(this.planId as string,this.auth.decodeUserInfoToken()).pipe(
      map(i => i as SuccessHandle)
    ).subscribe(res => {
      console.log(res);
      this.spinner.removeSpinner('#btn1')
      window.location.href = res.data
    })
  }

  ngOnDestroy(){
    this.subscribtion.unsubscribe()
    this.subscribtion2.unsubscribe()
  }

}
