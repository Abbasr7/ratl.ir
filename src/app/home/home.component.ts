import { Component, OnInit } from '@angular/core';
import { AuthService } from '../controlers/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private auth:AuthService) { }

  token:string
  
  ngOnInit(): void {
  }

  genToken(){
    let test:any = this.auth.isLoggedIn()
  }

}