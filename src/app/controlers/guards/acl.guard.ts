import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { IAccessControlLevel } from '../interfaces/interfaces';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AclGuard implements CanActivate,Resolve<IAccessControlLevel> {

  constructor(private user:UserService){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IAccessControlLevel> | Promise<IAccessControlLevel> | IAccessControlLevel {
    console.log(route.url);
    let url = state.url as string
    console.log(url);
    

    let test:IAccessControlLevel = {id:'asd',access:'asdas'}
    return test
  };

  
}
