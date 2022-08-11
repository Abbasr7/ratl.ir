import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { IProjact, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';

@Component({
  selector: 'app-user-projacts',
  templateUrl: './user-projacts.component.html',
  styleUrls: ['./user-projacts.component.css']
})
export class UserProjactsComponent implements OnInit {

  constructor(private projactService:ProjactsService) { }

  projactList: any;

  ngOnInit(): void {
    this.projactService.getAllUserProjacts().pipe(
      map(res => res as SuccessHandle ),
      // map(res => res.data as IProjact[])
    ).subscribe({
      next: (res) => {
        this.projactList = res.data
        console.log(res,this.projactList);
      }
    })
  }

  toPersianDate(date:any){
    const options = { year: 'numeric', month: 'long',day: 'numeric',hour:'2-digit', minute:'2-digit' } as const
    let persianDate = new Date(Date.parse(date)).toLocaleDateString('fa-Ir',options);
    return persianDate
  }
}
