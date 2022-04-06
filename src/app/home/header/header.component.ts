import { Component, DoCheck, OnInit } from '@angular/core';
import { AuthService } from 'src/app/controlers/services/auth.service';
import { CartService } from 'src/app/controlers/services/cart.service';
import { UserService } from 'src/app/controlers/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,DoCheck {

  constructor(private authService:AuthService,
    private cart:CartService,
    private userService:UserService) { }

  loggedIn:boolean = false
  cartCount:number = this.cart.getItems().length
  ngOnInit() {

    if (this.authService.isTokenValid()) {
      this.loggedIn = true
    }
  }

  ngDoCheck(){
    this.cartCount = this.cart.getItems().length
  }

  logOut(){
    if (!this.authService.isTokenValid()) {
      this.loggedIn = false
    }
    this.authService.logOut()
  }

}
