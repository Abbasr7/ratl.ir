import { Component, OnInit } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { lastValueFrom, map, take } from 'rxjs';
import { SuccessHandle } from './controlers/interfaces/interfaces';
import { ServerService } from './controlers/services/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private server: ServerService,
     private titleService: Title,
     private meta: Meta) {
  }

  title = 'سایت من';
  metaTags: any[] = []

  ngOnInit() {
    this.setTitle()
  }

  setTitle() {
    lastValueFrom(this.server.get('/api/settings').pipe(
      map(i => i as SuccessHandle),
      take(1)
    )).then(res => {      
      if (res.data){
        this.title = res.data.title?res.data.title:'';
        let keywords = res.data.keywords?{name:'keywords',content:res.data.keywords}:''
        let description = res.data.description?{name:'description',content:res.data.description}:''
        this.metaTags.push(keywords,description)
        res.data.metatags? res.data.metatags.forEach((tags:any) => {
          this.metaTags.push(tags)
        }):'';
        this.titleService.setTitle(this.title)
        this.meta.addTags(this.metaTags)
      }
    })
  }

}
