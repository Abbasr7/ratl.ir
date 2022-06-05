import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit,OnDestroy, Renderer2 } from '@angular/core';
import { catchError, map, Observable, of, Subscription, tap } from 'rxjs';
import { IUser, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Spinner } from 'src/app/controlers/utils';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit,OnDestroy {

  constructor(private server:ServerService,
    private renderer:Renderer2,
    @Inject(DOCUMENT) private document:any,
    private spinner:Spinner,
    private msg:MessagesService) { }

  usersList:IUser[]
  sub1$:Subscription 
  //for pagination
  totalRecords:string
  page:number = 1
  prePage:number = 5
  // avatar
  apiUrl = Globals.apiUrl
  avatar: string = '/assets/img/profile-pic.png';
  // for search in table
  fullName:string
  // to sort table's data
  keyToSort:string = 'fullname'
  reverse:boolean = false

  ngOnInit(): void {
    this.sub1$ = this.server.get('/admin/getdata?type=users').pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IUser[])
    ).subscribe(res => {      
      this.usersList = res
    })

  }
  // for search in table
  search(){
    if (this.fullName != "") {
      this.usersList = this.usersList.filter(user => {
        return user.fullname?.toLocaleLowerCase().match(this.fullName.toLocaleLowerCase())
      })
    } else {
      this.ngOnInit()
    }
  }
  // to sort table's data
  sort(key:string){
    this.keyToSort = key
    this.reverse = !this.reverse
  }
  
  removeUser(id:HTMLInputElement){

    this.spinner.addSpinner('#modal_ok_btn')

    this.sub1$ = this.server.delete('/admin/removedata?type=users&id='+id.value).pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IUser[]),

      catchError(error => {
        return of('')
      })
    ).subscribe((res:any) => {

      if (res) {
        this.usersList = res.data
        //send message
        if (res) this.msg.sendMessage('کاربر مورد نظر با موفقیت حذف گردید','success')
      }
      this.spinner.removeSpinner('#modal_ok_btn')
      // to close modal
      let popUp = this.renderer.selectRootElement('#popup-modal',true)
      this.renderer.setStyle(popUp,'display','none')

    })
  }

  ngOnDestroy(): void {
    this.sub1$.unsubscribe()
  }
}
