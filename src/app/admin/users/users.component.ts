import { Component, OnInit } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { IUser, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ServerService } from 'src/app/controlers/services/server.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  constructor(private server:ServerService) { }

  usersList:Observable<IUser[]>
  // alpine = Alpine
  ngOnInit(): void {
    this.usersList = this.server.get('/admin/getdata?data=users').pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IUser[])
    )

  }
  
  removeUser(id:HTMLInputElement){
    console.log(id.value);
    this.server.delete('/admin/removedata?type=users&id='+id.value).pipe(
      map(res => res as SuccessHandle),
      catchError(error => {
        return of('0')
      })
    ).subscribe(res => {
      console.log(res);
      
    })
  }

}
