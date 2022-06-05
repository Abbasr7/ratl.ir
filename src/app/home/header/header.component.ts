import { Component, DoCheck, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from 'src/app/controlers/services/auth.service';
import { CartService } from 'src/app/controlers/services/cart.service';
import { SettingsService } from 'src/app/controlers/services/settings.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,DoCheck {
  
  constructor(private authService:AuthService,
    private cart:CartService,
    private settings:SettingsService,
    private userService: UserService) { }
    
  apiUrl = Globals.apiUrl;
  logo:string;
  loggedIn:boolean = false
  cartCount:number = this.cart.getItems().length
  userInfo: any;
  
  ngOnInit() {
    this.setSettings();
    if (this.authService.isTokenValid()) {
      this.loggedIn = true
    }
  }

  ngDoCheck(){
    this.cartCount = this.cart.getItems().length,
    this.getUserInfo()
  }

  async logOut(){
    await this.authService.logOut()
    if (!this.authService.isTokenValid()) {
      this.loggedIn = false
    }
  }

  async setSettings(){
    let res = await this.settings.getSettings()
    this.logo = res.logo && res.logo != 'null'?this.apiUrl + res.logo:'';
  }

  getUserInfo(){
    this.userService.userInfo.pipe(
      take(2)
    ).subscribe(res => {
      this.userInfo = res
    })
  }
}
