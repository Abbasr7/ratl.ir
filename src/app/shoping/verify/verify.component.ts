import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  constructor(private route:ActivatedRoute) { }

  status:any
  code:string|null;
  transaction_id:string|null;
  pay_id:string|null
  msg:string|null;
  data:any;
  ngOnInit(): void {

    this.status = this.route.snapshot.queryParamMap.get('status')
    this.code = this.route.snapshot.queryParamMap.get('code')
    this.transaction_id = this.route.snapshot.queryParamMap.get('ref_id')
    this.pay_id = this.route.snapshot.queryParamMap.get('pid')
    this.msg = this.code == '101'?'قبلا پرداخت شده است': this.route.snapshot.queryParamMap.get('msg')
    this.data = this.route.snapshot.queryParamMap.get('data')

  }

}
