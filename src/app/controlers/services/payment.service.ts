import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http:HttpClient) { }
  // URL = "https://api.idpay.ir/v1.1/payment/verify";
  
  // goToPay(data:any){
  //   let headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'X-API-KEY': '6a7f99eb-7c20-4412-a972-6dfb7cd253a4',
  //     'X-SANDBOX': '1',
  //   });
  //   let body = {
  //     'order_id': '101',
  //     'amount': 10000,
  //     'name': 'قاسم رادمان',
  //     'phone': '09382198592',
  //     'mail': 'my@site.com',
  //     'desc': 'توضیحات پرداخت کننده',
  //     'callback': 'https://example.com/callback',
  //   }

  //   return this.http.post(this.URL,body,{headers: headers})
  // }
}
