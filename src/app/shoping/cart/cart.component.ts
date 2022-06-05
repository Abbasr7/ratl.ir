import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subscription, take } from 'rxjs';
import { Iplans, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
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
export class CartComponent implements OnInit {

  constructor(
    private auth:AuthService,
    private server:ServerService,
    private cart:CartService,
    private route:ActivatedRoute,
    private user:UserService,
    private msg:MessagesService,
    private spinner:Spinner,
    private router:Router) { }

  loggedin:any[] = [];
  data:Iplans = new Iplans;
  items:any;
  planId:string|null;
  submitted:boolean = false
  modal:TemplateRef<any>;

  async ngOnInit() {

    this.loggedin = await this.auth.isLoggedIn()
    this.items = this.cart.getItems()
    
    this.planId = this.route.snapshot.paramMap.get('id')

    this.server.get('/plan/details/'+this.planId).pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe(res => {
      this.data = res.data
    })

  }

  toPrice(){
    this.spinner.addSpinner('#price')
    this.submitted = true
    if (!this.loggedin[0]) {
      this.msg.sendMessage(this.loggedin[2],'warning')
      this.spinner.removeSpinner('#price')
      return
    }

    this.cart.checkOut(this.planId as string,this.auth.decodeUserInfoToken()).pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe(res => {
      console.log(res);
      this.spinner.removeSpinner('#price')
      window.location.href = res.data
    })
  }

}
