import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router:Router,
    private msg:MessagesService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isLoggedIn(route);
  }
  
  async isLoggedIn(route:ActivatedRouteSnapshot){
    let Authenticate = await this.authService.isLoggedIn()

    if (Authenticate[0]) {  
      return this.router.createUrlTree(['/']) 
    }
    return true
  }
}
