import { Component, Input, OnInit } from '@angular/core';
import { map, take } from 'rxjs';
import { IMenu, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { AuthService } from 'src/app/controlers/services/auth.service';
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
    private settings:SettingsService,
    private authService:AuthService) { }

  apiUrl = Globals.publicApi.getMenus
  @Input('loc') loc:string;
  @Input('showSidebar') showSidebar:boolean;

  headerMenuList: IMenu = new IMenu;
  footerMenuList: IMenu;
  sideNav: boolean;
  logo: string;
  title: string;
  loggedIn: boolean = false;

  ngOnInit(): void {
    this.getListsAndItems();
    this.setSettings();
    if (this.authService.isTokenValid()) {
      this.loggedIn = true
    }
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
    });
  }

  async setSettings(){
    let data = await this.settings.getSettings()
    if (data) {
      data.logo && data.logo != 'null'? this.logo = this.apiUrl + data.logo:'';
      this.title = data.title
    }
  }

  openSubMenu(event:Event) {
    let id = (<HTMLElement>event.target).getAttribute('data-id');
    let subMenu = document.querySelector(`#sub-${id}`)
    subMenu?.classList.toggle('hidden');
    console.log(event,subMenu);
    
  }

  closeMobileNav() {
    const menu = document.querySelectorAll('.navbar-menu');

    if (menu.length) {
      menu[0].classList.toggle('hidden');
    }
  }
}
