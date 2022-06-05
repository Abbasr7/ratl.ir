import { Component, DoCheck, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { IUserInfo } from '../controlers/interfaces/interfaces';
import { UserService } from '../controlers/services/user.service';
import { Globals } from '../globals';


@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit, DoCheck {

  constructor(private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title) { }
  
  title:string = this.activatedRoute.snapshot.data['title']
  apiUrl = Globals.apiUrl
  url = this.router.url
  userInfo: IUserInfo = new IUserInfo;
  
  ngOnInit() {
    this.titleService.setTitle(this.title)
    this.getUserInfo(),
    this.setTitle()
  }
  ngDoCheck() {
    // برای مشاهده تغییرات اعمال شده
    this.getUserInfo()
  }

  getUserInfo(){
    this.userService.userInfo.pipe(
      take(2)
    ).subscribe(res => {
      this.userInfo = res
    })
  }

  setTitle() {
    this.router
      .events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const child = this.activatedRoute.firstChild;
          this.url = this.router.url
          if (child?.snapshot.data['title']) {            
            return this.title +'- '+ child?.snapshot.data['title'];
          }
          return this.title;
        })
      ).subscribe(res => {
        this.titleService.setTitle(res)
      });
  }

}
