import { Component, OnInit } from '@angular/core';
import { map, shareReplay, take } from 'rxjs';
import { IRole, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { SettingsService } from 'src/app/controlers/services/settings.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  apiUrl = Globals.apiUrl;
  title:string;
  promise:any[] = [];
  show: any;
  logo:string
  constructor(private settings:SettingsService,private userService:UserService) { }

  ngOnInit(): void {
    this.setSettings()
  }

  async setSettings(){
    let data = await this.settings.getSettings()
    data.logo && data.logo != 'null'? this.logo = this.apiUrl + data.logo:'';
    this.title = data.title;
    this.userService.userInfo.pipe(
      map(res => res.user.role as IRole),
      take(1),
      shareReplay()
    ).subscribe(res => {
      this.promise = res.access;
    })
  }

}
