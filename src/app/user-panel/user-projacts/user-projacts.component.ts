import { Component, OnInit, Renderer2 } from '@angular/core';
import { map } from 'rxjs';
import { IProjact, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-user-projacts',
  templateUrl: './user-projacts.component.html',
  styleUrls: ['./user-projacts.component.css']
})
export class UserProjactsComponent implements OnInit {

  constructor(private projactService:ProjactsService,
    private renderer:Renderer2, private spinner:Spinner,
    private msg: MessagesService) { }

  projactList: any;

  ngOnInit(): void {
    this.projactService.getAllUserProjacts().pipe(
      map(res => res as SuccessHandle ),
      // map(res => res.data as IProjact[])
    ).subscribe({
      next: (res) => {
        this.projactList = res.data
      }
    })
  }

  removeItem(id: HTMLInputElement) {

    this.spinner.addSpinner('#modal_ok_btn')

    this.projactService.delete(id.value).pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IProjact[]),
    ).subscribe({
      next: res => {
        this.projactList = res
        //send message
        this.msg.sendMessage('کاربر مورد نظر با موفقیت حذف گردید', 'success')

        this.spinner.removeSpinner('#modal_ok_btn')
        // to close modal
        let popUp = this.renderer.selectRootElement('#popup-modal', true)
        this.renderer.setStyle(popUp, 'display', 'none')
      }
    })
  }

  toPersianDate(date:any){
    const options = { year: 'numeric', month: 'long',day: 'numeric',hour:'2-digit', minute:'2-digit' } as const
    let persianDate = new Date(Date.parse(date)).toLocaleDateString('fa-Ir',options);
    return persianDate
  }
}
