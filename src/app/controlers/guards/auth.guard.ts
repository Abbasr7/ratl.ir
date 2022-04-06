import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { IUserInfo } from '../interfaces/interfaces';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{
  constructor(
    private authService: AuthService,
    private router:Router,
    private msg:MessagesService,
    private user:UserService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return this.isAuthenticated(route)
  }

  async isAuthenticated(route:ActivatedRouteSnapshot){
    let Authenticate = await this.authService.isLoggedIn()

    if (!Authenticate[0]) {  
      this.msg.sendMessage(Authenticate[2] as string,'danger',5000)
      this.authService.logOut();
      this.authService.redirectUrl = route.url;
      
      return this.router.createUrlTree(['/login']) 
    }

    return true
  }

}
