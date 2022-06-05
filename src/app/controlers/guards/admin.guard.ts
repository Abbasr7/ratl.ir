
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Globals } from 'src/app/globals';
import { MessagesService } from '../services/messages.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService:UserService,
    private msg:MessagesService,
    private router:Router){}

  Url = Globals.apiUrl
  userInfo = this.userService.userInfo.value
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let access = route.data['access'];

      return this.hasAccess(route.data['access']);
  }
  
  async hasAccess(access:string){
    let hasAccess = await this.userService.hasPromit(access)

    if (hasAccess) {
      return true
    } else {
      this.msg.sendMessage('شما دسترسی کافی به این مورد را ندارید.','warning')
      return this.router.createUrlTree(['/'])
    }
  }
}
