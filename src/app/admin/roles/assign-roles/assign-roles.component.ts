import { Component, Input, OnInit } from '@angular/core';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { IRole, IUser, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ServerService } from 'src/app/controlers/services/server.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-assign-roles',
  templateUrl: './assign-roles.component.html',
  styleUrls: ['./assign-roles.component.css']
})
export class AssignRolesComponent implements OnInit {

  constructor(private server:ServerService,
    private spinner:Spinner,
    private userService:UserService) { }

  @Input('user') user:IUser
  adminInfo = this.userService.userInfo.value
  subscribe2:Subscription
  roles:IRole[]

  ngOnInit(): void {
    this.subscribe2 = this.server.get('/admin/getdata?type=role').pipe(
      map(i => i as SuccessHandle)
    ).subscribe(res =>{
      this.roles = res.data
    })
  }

  changeRole($event:Event){
    this.spinner.addSpinner('#success-icon')
    let selectedItem = (<HTMLInputElement>$event.target).value
    this.user.role._id = selectedItem

    let save = lastValueFrom(this.server.update('/user/changerole',this.user)).then(res => {
      this.spinner.removeSpinner('#success-icon')
      this.spinner.addSuccessIcon('#success-icon')
    })
  }

  hasAccess(){
    if (this.adminInfo.user.role.access.includes('all') // فقط مدیر اصلی سایت دسترسی دارد
     && this.user._id != this.adminInfo.user._id) { // برای جلوگیری از تغییر دسترسی مدیر اصلی سایت
      return true
    }
    return false
  }
}
