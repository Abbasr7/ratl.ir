import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { map, take } from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Spinner } from 'src/app/controlers/utils';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styleUrls: ['./new-page.component.css']
})
export class NewPageComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private server: ServerService,
    private msg: MessagesService,
    private spinner: Spinner,
    private route: ActivatedRoute) { }


  pageTitle = this.route.snapshot.paramMap.get('title')
  // kolkov editor config
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '300px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    // enableToolbar: true,
    // showToolbar: true,
    placeholder: 'Enter text here...',
    defaultFontName: 'iransans',
    defaultFontSize: '4',
    fonts: [
      { class: 'yekan', name: 'yekan' },
      { class: 'iransans', name: 'iransans' },
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    sanitize: true,
    toolbarPosition: 'top',
  };

  //form
  form: FormGroup = this.fb.group({
    title: ['', [Validators.required,Validators.minLength(3)]],
    abstract: [''],
    htmlcontent: ['',Validators.required],
  })
  loading = false

  // kolkov
  ngOnInit(): void {
    if (this.pageTitle) {
      this.assignData()
    }
  }

  assignData(){
    this.server.get('/page/details/'+this.pageTitle).pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe({
      next: res => {
        this.form.patchValue(res.data)
      }
    })
  }
  save() {
    if (this.form.invalid) {
      this.msg.sendMessage('موارد خواسته شده را تکمیل کنید.','warning')
      return
    }
    this.loading = true
    this.spinner.addSpinner('.publish');

    let save$ = this.pageTitle ?
      this.server.update('/page/edit/?type=pages' + this.pageTitle, this.form.value) :
      this.server.create('/page/new?type=pages', this.form.value);

    save$.pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.msg.sendMessage('با موفقیت ذخیره شد.','success');
        this.spinner.removeSpinner('.publish');
        this.spinner.addSuccessIcon('.publish');
      },
      error: (err) => {
        this.loading = false;
        this.msg.sendMessage('مشکلی در ذخیره و انتشار بوجود آمد.','danger');
        this.spinner.removeSpinner('.publish');
      }
    })
  }

}
