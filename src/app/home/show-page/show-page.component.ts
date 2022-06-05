import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs';
import { IPages, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-show-page',
  templateUrl: './show-page.component.html',
  styleUrls: ['./show-page.component.css']
})
export class ShowPageComponent implements OnInit {

  constructor(private server:ServerService,
    private route:ActivatedRoute) { }

  pageTitle:any = this.route.snapshot.paramMap.get('title')
  page: IPages = new IPages;

  ngOnInit(): void {
    this.getPageDetails()
  }

  getPageDetails(){
    this.server.get(Globals.pagesApi.details+this.pageTitle).pipe(
      map(i => i as SuccessHandle),
      map(i => i.data as IPages),
      take(1)
    ).subscribe({
      next: res =>{
        this.page = res
      }
    })
  }

  toPersianDate(date:any){
    const options = { year: 'numeric', month: 'long',day: 'numeric',hour:'2-digit', minute:'2-digit' } as const
    let persianDate = new Date(Date.parse(date)).toLocaleDateString('fa-Ir',options);
    return persianDate
  }
}
