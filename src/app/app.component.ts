import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, lastValueFrom, ReplaySubject } from 'rxjs';
import { IUserInfo } from './controlers/interfaces/interfaces';
import { AuthService } from './controlers/services/auth.service';
import { UserService } from './controlers/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private user:UserService,private auth:AuthService){
    
  }
  title = 'site';

  ngOnInit(){
    
  }

}
