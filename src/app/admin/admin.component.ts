import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, lastValueFrom, map, shareReplay, take } from 'rxjs';
import { IUserInfo, SuccessHandle } from '../controlers/interfaces/interfaces';
import { ServerService } from '../controlers/services/server.service';
import { UserService } from '../controlers/services/user.service';
import { Globals } from '../globals';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private titleService:Title, private userService:UserService,
    private router:Router, private activatedRoute:ActivatedRoute) { }
  
  apiUrl = Globals.apiUrl
  title = this.activatedRoute.snapshot.data['title'];
  url = this.router.url;
  userInfo:IUserInfo = new IUserInfo;

  ngOnInit(): void {
    this.setTitle()
    this.setUserInfo()
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

  setUserInfo(){
    this.userService.userInfo.pipe(
      take(2),
      shareReplay()
    ).subscribe(res => {
      this.userInfo = res
    })
  }

}
