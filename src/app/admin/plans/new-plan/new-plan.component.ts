import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, map, take } from 'rxjs';
import { Iplans, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { Globals } from 'src/app/globals';
import { ServerService } from '../../../controlers/services/server.service'

@Component({
  selector: 'app-new-plan',
  templateUrl: './new-plan.component.html',
  styleUrls: ['./new-plan.component.css']
})
export class NewPlanComponent implements OnInit {

  planId = this.activatedRoute.snapshot.paramMap.get('id');
  constructor( private fb: FormBuilder,
  private server: ServerService,
  private msg: MessagesService,
  private activatedRoute: ActivatedRoute) {
    this.flag = 'time'
    for (let i = 0; i <= 12; i++) {
      this.month.push(i + ' ماه')
    }
    for (let i = 0; i <= 30; i++) {
      this.day.push(i + ' روز')
    }
  }

  plansApi = Globals.plansApi
  loading: boolean = false;
  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    time: this.fb.group({
      month: [''],
      day: ['']
    }),
    quantity: [''],
    cost: ['', Validators.required],
    items: ['', Validators.required],
    exceptions: [''],
    description: ['']
  })
  flag: any;
  month: string[] = []
  day: string[] = []

  ngOnInit(): void {
    if (this.planId) {
      this.assignData()
    }
  }

  assignData() {
    this.server.get(this.plansApi.details + this.planId).pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as Iplans),
      take(1)
    ).subscribe(res => {
      this.form.patchValue(res)
      this.items = this.form.value.items
      this.exceptions = this.form.value.exceptions
    })
  }

  exists: string
  items: string[] = []
  exceptions: string[] = []
  addItem(input: HTMLInputElement, $event: Event, type: string = '') {
    $event.preventDefault()

    let newVal = input.value

    if (type == 'exceptions') {
      newVal && !this.exceptions.includes(newVal) ?
        this.exceptions.push(newVal) : this.exists = newVal;
    } else {
      newVal && !this.items.includes(newVal) ?
        this.items.push(newVal) : this.exists = newVal;
    }

    this.form.patchValue({
      items: this.items,
      exceptions: this.exceptions
    })

    input.value = '';

    setTimeout(() => {
      this.exists = ''
    }, 1000);
  }

  remove(el: number, type: string = '') {
    type == 'exceptions' ? this.exceptions.splice(el, 1) : this.items.splice(el, 1)
  }

  save() {
    if (this.form.invalid) {
      console.log(this.form.invalid);

      return
    }
    this.loading = true
    let savePlan$ = this.planId ?
      this.server.update(this.plansApi.edit + this.planId, this.form.value) :
      this.server.create(this.plansApi.create, this.form.value);

    savePlan$.pipe(
      delay(3000)
    ).subscribe({
      next: (res) => {
        this.loading = false;
        this.msg.sendMessage('با موفقیت ذخیره شد', 'success')
        if (!this.planId) {
          this.items = [];
          this.exceptions = [];
          this.form.reset();
        }
      },
      error: () => {
        this.loading = false
      }
    })
  }
}
