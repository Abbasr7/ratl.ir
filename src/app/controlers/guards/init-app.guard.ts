import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { Globals } from 'src/app/globals';
import { MessagesService } from '../services/messages.service';

@Injectable({
  providedIn: 'root'
})
export class InitAppGuard implements CanActivate {

  constructor(
    private http: HttpClient,
    private msg: MessagesService,
    private router: Router) { }

  Url = Globals.apiUrl
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isInitializedApp();
  }

  async isInitializedApp() {
    let adminExist: any = await this.isAdminExist()

    if (adminExist.data == 0) {
      this.msg.sendMessage('به راه اندازی اولیه سایت خوش آمدید.', 'info', 4000)
      return true
    } else {
      return this.router.createUrlTree(['/'])
    }
  }

  private async isAdminExist() {
    let res = await lastValueFrom(this.http.get(this.Url + '/user/init/check'))
    return res
  }
}
