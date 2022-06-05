import { Component, Input, OnInit } from '@angular/core';
import { map, take } from 'rxjs';
import { IMenu, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ServerService } from 'src/app/controlers/services/server.service';
import { SettingsService } from 'src/app/controlers/services/settings.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-show-menus',
  templateUrl: './show-menus.component.html',
  styleUrls: ['./show-menus.component.css']
})
export class ShowMenusComponent implements OnInit {

  constructor(private server:ServerService,
    private settings:SettingsService) { }

  apiUrl = Globals.publicApi.getMenus
  @Input('loc') loc:string;
  headerMenuList:IMenu = new IMenu;
  footerMenuList:IMenu ;
  logo:string;
  title:string;

  ngOnInit(): void {
    this.getListsAndItems();
    this.setSettings();
  }

  getListsAndItems() {
    // get header menu
    this.server.get(this.apiUrl+'?loc=headermenu').pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe({
      next:(res) => {
        res.data? res.data.order = JSON.parse(res.data?.order):'';
        this.headerMenuList = res.data
      }
    })

    // get footer menu
    this.server.get(this.apiUrl+'?loc=footermenu').pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe({
      next:(res) => {
        res.data? res.data.order = JSON.parse(res.data?.order):'';
        this.footerMenuList = res.data;
      }
    })
    
  }

  async setSettings(){
    let data = await this.settings.getSettings()
    data.logo && data.logo != 'null'? this.logo = this.apiUrl + data.logo:'';
    this.title = data.title
  }
}
