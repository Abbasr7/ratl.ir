import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { delay, Observable, of } from 'rxjs';
import { activePlans } from '../interfaces/interfaces';
import { MessagesService } from '../services/messages.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class CartResolveGuard implements CanActivate {

  constructor(private userService: UserService,
    private msg:MessagesService,
    private router:Router){
    }
    
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise< boolean | UrlTree > {
    let test = await this.userService.setUserInfo() // برای جلوگیری از ورود مستقیم کاربر
    
    let id = <string>route.paramMap.get('id')
    let data:activePlans[] = this.isPriced(id)
    if (data.length>0) {
      this.msg.sendMessage('شما قبلا این پلن را خریداری کرده اید و هنوز منقضی نشده اشت.','warning')
      return this.router.createUrlTree(['/'])
    }
    return true
  }
  isPriced(id:string){
    let activePlans =  this.userService.getPlansBalance()
    let priced = activePlans.filter((plan:activePlans) => plan.planid == id && plan.remaining>0)
    return priced
  }

}
