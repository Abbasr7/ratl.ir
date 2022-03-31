import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from '../../controlers/services/server.service'

@Component({
  selector: 'app-new-plan',
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit {

  constructor(
    private fb:FormBuilder,
    private server:ServerService,
    private msg:MessagesService) {

    this.flag = 'time'
    for (let i = 0; i <= 12; i++) {
      this.month.push(i+' ماه')    
    }
    for (let i = 0; i <= 30; i++) {
      this.day.push(i+' روز')
    }
   }

  binding:any;
  form:FormGroup = this.fb.group({
    subject: ['', Validators.required],
    time:this.fb.group({
      month:[''],
      day:['']
    }),
    project_count:[''],
    cost:[''],
    description:['']

  })
  flag:any;
  month:string[] = []
  day:string[] = []
  ngOnInit(): void {
    
  }

  save(){
    console.log(this.form.value);
    this.server.create('/plan/newplan',this.form.value).subscribe(res => {
      console.log(res);
      this.msg.sendMessage('با موفقیت ذخیره شد','succes')
      
    })
  }
}
