import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as $ from 'jquery'
import { ISettings, ISocials } from 'src/app/controlers/interfaces/interfaces';
import { SettingsService } from 'src/app/controlers/services/settings.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(private sanitizer:DomSanitizer,
    private settings:SettingsService) { }

  title:string;
  extraHtml: any;
  socials:ISocials = new ISocials;
  footnote:string;

  ngOnInit(): void {

    this.setSettings()
    // let enamad = document.querySelector('.namad')
    // let script = document.createElement('script')
    // script.setAttribute('src','https://cdn.zarinpal.com/trustlogo/v1/trustlogo.js')
    // // enamad?.appendChild(script)
    // $('.namad').append(this.namad)
    
  }

  async setSettings(){
    let data = await this.settings.getSettings();
    if (data) {
      this.title = data.title
      this.socials = data.footer.social?data.footer.social:this.socials;
      data.footer.extraHtml?
        this.extraHtml = this.sanitizer.bypassSecurityTrustHtml(data.footer.extraHtml):'';
      data.footer.description?
        this.footnote = data.footer.description:'';
    }
  }

}
