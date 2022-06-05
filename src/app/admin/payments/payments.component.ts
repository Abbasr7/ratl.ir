import { Component, OnInit, Renderer2 } from '@angular/core';
import { map } from 'rxjs';
import { Ipayments, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  constructor(private server: ServerService,
    private spinner: Spinner,
    private msg: MessagesService,
    private renderer: Renderer2) { }

  payList: Ipayments[]
  //for pagination
  totalRecords: string
  page: number = 1
  prePage: number = 5
  // for search in table
  purchaser: string;
  // to sort table's data
  keyToSort: string = 'fullname'
  reverse: boolean = false

  ngOnInit(): void {
    this.assignData()
  }

  assignData() {
    this.server.get('/admin/getdata?type=payments').pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as Ipayments[])
    ).subscribe(res => {
      this.payList = res
    })
  }

  toPersianDate(date: string) {
    let persianDate = new Date(date).toLocaleDateString('fa-Ir');
    return persianDate
  }

  // for search in table 
  search() {
    if (this.purchaser != "") {
      this.payList = this.payList.filter(pay => {
        return pay.userid.fullname.toLocaleLowerCase().match(this.purchaser.toLocaleLowerCase())
      })
    } else {
      this.ngOnInit()
    }
  }
  // to sort table's data
  sort(key: string) {
    this.keyToSort = key
    this.reverse = !this.reverse
  }

  removeItem(id: HTMLInputElement) {

    this.spinner.addSpinner('#modal_ok_btn')

    this.server.delete('/page/delete/' + id.value).pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as Ipayments[]),
    ).subscribe({
      next: res => {
        this.payList = res
        //send message
        this.msg.sendMessage('کاربر مورد نظر با موفقیت حذف گردید', 'success')

        this.spinner.removeSpinner('#modal_ok_btn')
        // to close modal
        let popUp = this.renderer.selectRootElement('#popup-modal', true)
        this.renderer.setStyle(popUp, 'display', 'none')
      }
    })
  }

}
