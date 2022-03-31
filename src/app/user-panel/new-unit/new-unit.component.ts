import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessagesService } from 'src/app/controlers/services/messages.service';

@Component({
  selector: 'app-new-unit',
  templateUrl: './new-unit.component.html',
  styleUrls: ['./new-unit.component.css']
})
export class NewUnitComponent implements OnInit {

  constructor(
    private fb:FormBuilder,
    private msg:MessagesService
  ) { }

  form:FormGroup = this.fb.group({
    test:[]
  })
  loading:boolean = false
  ngOnInit(): void {
  }

  get f(){
    return this.form.controls
  }
  estimate(){

  }

}
