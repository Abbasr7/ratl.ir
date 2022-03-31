import { AfterViewInit, Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { activePlans, IUserInfo, SuccessHandle } from '../controlers/interfaces/interfaces';
import { AuthService } from '../controlers/services/auth.service';
import { ServerService } from '../controlers/services/server.service';
import { UserService } from '../controlers/services/user.service';
import { Globals } from '../globals';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit,DoCheck {

  constructor(private userService:UserService,private auth:AuthService,private router:Router) { }

  apiUrl = Globals.apiUrl
  userInfo:any ;
  planBalance:activePlans[];
  ngOnInit() {
    this.userInfo = this.userService.userInfo.value
    this.planBalance = this.userService.getPlansBalance()
    console.log(this.userService.hasActivePlan().length?true:false);
  }
  ngDoCheck(){
    // برای مشاهده تغییرات اعمال شده
    this.userInfo = this.userService.userInfo.value
  }

  logout(){
    this.auth.logOut()
    this.router.navigate(['/'])
  }

}
