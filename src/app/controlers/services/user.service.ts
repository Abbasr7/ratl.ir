import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { activePlans, IRole, IUser, IUserInfo, SuccessHandle } from '../interfaces/interfaces';
import { Globals } from '../../globals';
import { Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, lastValueFrom, map, of, take, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private auth: AuthService, private router: Router,
    private jwtHelper: JwtHelperService) {
    this.setUserInfo()
  }

  private Url = Globals.apiUrl
  private usersApi = Globals.usersApi;
  public redirectUrl: UrlSegment[];
  public userInfo = new BehaviorSubject(new IUserInfo)
  public token: string

  getToken() {
    return <string>localStorage.getItem('auth-token');
  }

  decodeToken() {
    return this.jwtHelper.decodeToken(this.getToken())
  }
  getUserInfo() {
    let authenticate = this.auth.isTokenValid()
    if (authenticate) {
      return this.http.get(this.Url + this.usersApi.userinfo)
    }
    return of(0)
  }
  // to get user info from server and set to userInfo variable
  async setUserInfo() {
    await lastValueFrom(this.getUserInfo()).then((res: any) => {
      this.userInfo.next(res.data as IUserInfo)
    })
  }

  getPlansBalance() {
    if (this.userInfo.value) {
      let activePlans = this.userInfo.value.payments.filter((pay: any) => pay.active === true)

      const Percentage = (A: number, a: number) => {
        return a * 100 / A
      }
      let today = new Date().getTime();
      let plans: activePlans[] = []

      activePlans.forEach((x: any) => {
        let planLifeTime = x.planid.time.month * 30 * 24 * 3600 * 1000 + x.planid.time.day * 24 * 3600 * 1000
        let pricedAt = Date.parse(x.createdAt)
        let currentDay = today - pricedAt

        if (planLifeTime - currentDay > 0) {
          let xx = {
            pay_id: x._id,
            planid: x.planid._id,
            planLifeTime: planLifeTime,
            percentOfUse: Percentage(planLifeTime, currentDay),
            used: Math.round(currentDay / 24 / 3600 / 1000), // The amount of plan used DAY
            remaining: Math.round((planLifeTime - currentDay) / 24 / 3600 / 1000) //The remaining DAY amount of the plan
          }

          plans.push(xx)
        } else {
          // برای غیرفعال کردن پلن منقضی شده
          lastValueFrom(this.http.put(this.Url + Globals.paymentsApi.deactivePlan, { id: x._id })).then();
        }

      });

      return plans
    }
    return []

  }

  changePassword(params: {}) {
    return this.http.put(this.Url + this.usersApi.editPassword, params)
  }

  editUser(data: IUser, pic: File) {
    let formData = new FormData();
    formData.append('id', data._id)
    formData.append('username', data.username)
    pic ? formData.append('pic', pic) : '';
    formData.append('email', data.email)
    data.fullname ? formData.append('fullname', data.fullname) : '';
    data.address ? formData.append('address', data.address) : '';
    data.phone ? formData.append('phone', data.phone) : '';

    return this.http.put(this.Url + this.usersApi.edit, formData)
  }

  async hasPromit(permit: string) {
    let result = false
    
    let user_info = await lastValueFrom(this.http.get(this.Url + '/user/userinfo?type=role').pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IRole)
    ))
    let access = user_info.access.find((permission: any) => {
      return permission == 'all' || permission == permit
    })
    if (access?.length) {
      result = true
    }

    return result
  }
}
