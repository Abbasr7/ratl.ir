import { Component, OnInit, Renderer2 } from '@angular/core';
import { map } from 'rxjs';
import { Iplans, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {

  constructor(private server: ServerService,
    private spinner: Spinner,
    private msg: MessagesService,
    private renderer: Renderer2) { }

  plansList: Iplans[]
  //for pagination
  totalRecords: string
  page: number = 1
  prePage: number = 5
  // for search in table
  planTitle: string;
  // to sort table's data
  keyToSort: string = 'fullname'
  reverse: boolean = false

  ngOnInit(): void {
    this.assignData()
  }

  assignData(){
    this.server.get('/admin/getdata?type=plans').pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as Iplans[])
    ).subscribe(res => {      
      this.plansList = res
    })
  }

  // for search in table 
  search() {
    if (this.planTitle != "") {
      this.plansList = this.plansList.filter(plan => {
        return plan.title.toLocaleLowerCase().match(this.planTitle.toLocaleLowerCase())
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

  removeUser(id: HTMLInputElement) {

    this.spinner.addSpinner('#modal_ok_btn')

    this.server.delete('/admin/removedata?type=plans&id=' + id.value).pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as Iplans[]),
    ).subscribe({
      next: res => {
        this.plansList = res
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
