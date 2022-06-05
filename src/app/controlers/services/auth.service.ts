import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router, UrlSegment } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Globals } from 'src/app/globals';
import { MessagesService } from './messages.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private msg:MessagesService,
    private jwtHelper: JwtHelperService) { 
    }

  private Url = Globals.apiUrl;
  private usersApi = Globals.usersApi;
  public pattern = /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/i
  public loggedIn:boolean = false
  public redirectUrl:string|UrlSegment[]
  

  Register(data: any, url?: string) {
    let subUrl = url ? url : 'register';
    return this.http.post<any>(`${this.Url}/user/${subUrl}`, data);
  }

  Login(data: string) {
    return this.http.post(this.Url+this.usersApi.login, data);
  }

  async logOut() {
    await lastValueFrom(this.http.post(this.Url+this.usersApi.logout, '')).then(res =>{
      this.loggedIn = false
      localStorage.removeItem('auth-token');
    }).catch(err => {
      this.msg.sendMessage('مشکلی در خروج از حساب کاربری رخ داد','warning')
    })
  }

  setToken(token:string){
    return localStorage.setItem('auth-token',token)
  }
  getToken() {
    return <string>localStorage.getItem('auth-token')
  }
  decodeUserInfoToken(){
    return this.jwtHelper.decodeToken(this.getToken())
  }

  isTokenValid(){
    let token = this.getToken()

    if (token && this.pattern.test(token)) {
      if (!this.jwtHelper.isTokenExpired(token)) {
        return true
      } else {
        // this.logOut()
        return false
      }
    } else {
      return false
    }
    
  }

  async isLoggedIn(){
    let token = this.getToken()

    if (token && this.pattern.test(token)) {

      if (!this.jwtHelper.isTokenExpired(token)) {

        this.loggedIn = await this.checkForLogin()
        let status = this.loggedIn?'VERIFY':'NOT_VERIFY';
        let msg = this.loggedIn?'توکن تایید شد.':'توکن از سمت سرور تایید نشد!'

        return [this.loggedIn,status,msg]
      } else {
        return [false,'TOKEN_EXPIRE','توکن شما منقضی شده است لطفا دوباره وارد حساب خود شوید.']
      }

    } else {
      return [false,'INVALID_TOKEN','ابتدا باید وارد حساب کاربری خود شوید.']
    }
  }

  private async checkForLogin(){
    let login = false
    await lastValueFrom(this.http.get(this.Url+this.usersApi.verifyToken+`?token=${this.getToken()}`)).then((val:any) => {
      if (val.data[0] == true) {
        login = true
      }
    })

    return login
  }

}
