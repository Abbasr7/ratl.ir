import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { last, lastValueFrom, Observable } from 'rxjs';
import { Globals } from 'src/app/globals';
import { IRole } from '../interfaces/interfaces';
import { MessagesService } from '../services/messages.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService:UserService,
    private http:HttpClient,
    private msg:MessagesService,
    private router:Router){}

  Url = Globals.apiUrl
  userInfo = this.userService.userInfo.value
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isAdmin();
  }
  
  async isAdmin(){
    let access = await this.userService.hasPromit('admin')

    if (access) {
      return true
    } else {
      this.msg.sendMessage('شما دسترسی کافی به این مورد را ندارید.','warning')
      return this.router.createUrlTree(['/'])
    }
  }
}
