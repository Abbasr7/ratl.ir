import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  promise:any = {
    role: 'admin',
    access: [
      'links',
      'roles',
      'users'
    ]
  }
  show: any  //this.promise.access.filter((i:any) => {i == 'links'})
  constructor() { }

  ngOnInit(): void {
    this.promise.access.forEach((i:any) => {
      if (i === 'links') {
        this.show = true
      }
    });
  }


}
