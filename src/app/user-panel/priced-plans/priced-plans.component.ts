import { Component, OnInit } from '@angular/core';
import { activePlans } from 'src/app/controlers/interfaces/interfaces';
import { UserService } from 'src/app/controlers/services/user.service';

@Component({
  selector: 'app-priced-plans',
  templateUrl: './priced-plans.component.html',
  styleUrls: ['./priced-plans.component.css']
})
export class PricedPlansComponent implements OnInit {
  
  constructor(private userService:UserService,) { }
  
  payList = this.userService.userInfo.value.payments
  planBalance:activePlans[];
  keyToSort: string;
  reverse: boolean;

  ngOnInit(): void {
    this.planBalance = this.userService.getPlansBalance()
  }

  getPlans(){}

  toPersianDate(date:any){
    const options = { year: 'numeric', month: 'long',day: 'numeric',hour:'2-digit', minute:'2-digit' } as const
    let persianDate = new Date(Date.parse(date)).toLocaleDateString('fa-Ir',options);
    return persianDate
  }

  // to sort table's data
  sort(key: string) {
    this.keyToSort = key
    this.reverse = !this.reverse
  }

}
