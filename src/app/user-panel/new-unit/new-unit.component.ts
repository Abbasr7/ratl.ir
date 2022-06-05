import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { KeyValue } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { map, take } from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { customValidate } from 'src/app/controlers/utils';

@Component({
  selector: 'app-new-unit',
  templateUrl: './new-unit.component.html',
  styleUrls: ['./new-unit.component.css'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class NewUnitComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private msg: MessagesService,
    private projacts: ProjactsService,
    private customValidator: customValidate,
    private userService: UserService
  ) { }

  net = {
    building: 1, // %
    equipment: 15, // %
    vehicles: 5, // %
  }
  rate: IRate = {
    building: 7, // %
    equipment: 10, // %
    vehicles: 25, // %
    officeEquipment: 10, // %
    preOperation: 20, // %
    pishbiniNashode: 10 // %
  }
  investForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    ground: this.fb.group({
      count: ['', Validators.required],
      cost: ['', Validators.required],
    }),
    landscaping: this.fb.array([this.createFormGroup('invest')]),
    building: this.fb.array([this.createFormGroup('invest')]),
    equipment: this.fb.array([this.createFormGroup('invest')]),
    vehicles: this.fb.array([this.createFormGroup('invest')]),
    officeEquipment: this.fb.array([this.createFormGroup('invest')]),
    preOperation: this.fb.group({
      research: ['', Validators.required],
      otherCosts1: ['', Validators.required],
      otherCosts2: ['', Validators.required],
      otherCosts3: ['', Validators.required],
      otherCosts4: ['', Validators.required],
      otherCosts5: ['', Validators.required],
      staffTraining: [''],
      tolidAzmayeshi: [''],
    }),
    pishbiniNashode: [''],
  }, { validators: this.customValidator.checkFormArrayValue('landscaping', 'building', 'equipment', 'vehicles', 'officeEquipment') })

  salaryForm: FormGroup = this.fb.group({
    jobTitles: this.fb.array([this.createFormGroup('jobTitles')]),
    jobLevels: this.fb.array([this.createFormGroup('jobTitles')]),
    employees: this.fb.array([this.createFormGroup('employees')]),
  }, { validators: this.customValidator.checkFormArrayValue('jobTitles', 'jobLevels', 'employees') });

  fundAndExpensesForm: FormGroup = this.fb.group({
    zarfiyateSalane: ['', Validators.required],
    time: ['', Validators.required],
    tankhah: ['', Validators.required],
    mojodiKala: ['', Validators.required],
    motalebat: ['', Validators.required],
    ghalebMasrafi: ['', Validators.required],
    mavadAvalie: this.fb.array([this.createFormGroup('mavadAvalie')]),
    hazineJari: this.fb.group({
      water: this.createFormGroup('hazineJari'),
      gasWarmSeasons: this.createFormGroup('hazineJari'),
      gasColdSeasons: this.createFormGroup('hazineJari'),
      electricity: this.createFormGroup('hazineJari'),
      phoneAndInternet: this.createFormGroup('hazineJari'),
      salaryPercent: ['', Validators.required]
    })
  }, { validators: this.customValidator.checkFormArrayValue('mavadAvalie') })

  modal: TemplateRef<any>
  langTip: string = "حتما زبان صفحه کلید خودرا به انگلیسی تغییر دهید"
  submitted = false;
  year = 1;


  ngOnInit(): void {
    this.assignData('investForm', 'salaryForm', 'fundAndExpensesForm')
  }

  get f1() {
    return this.investForm.controls
  }
  get f2() {
    return this.salaryForm.controls
  }
  get f3() {
    return this.fundAndExpensesForm.controls
  }

  createFormGroup(type: string) {
    switch (type) {
      case 'invest':
        return this.fb.group({
          title: [''],
          count: [''],
          cost: ['']
        })
        break;
      case 'jobTitles':
        return this.fb.group({
          title: ['']
        })
        break;
      case 'employees':
        return this.fb.group({
          title: [''],
          level: [''],
          count: [''],
          cost: [''],
        })
        break;
      case 'mavadAvalie':
        return this.fb.group({
          title: [''],
          scale: [''],
          count: [''],
          percent: [''],
          cost: [''],
        })
        break;
      case 'hazineJari':
        return this.fb.group({
          count: ['', Validators.required],
          cost: ['', Validators.required],
          percent: ['', Validators.required],
        })
      default:
        return ''
        break;
    }

  }

  assignData(...formNames: string[]) { // برای بازیابی آخرین اطلاعات وارد شده توسط کاربر

    formNames.forEach(formName => {
      let data = JSON.parse(localStorage.getItem(formName) as string)

      if (localStorage.getItem(formName)) {
        let currentDate = Date.now()

        if (currentDate <= data.expire) {
          switch (formName) {
            case 'investForm':
              this.investForm.patchValue(data);
              break;
            case 'salaryForm':
              this.salaryForm.patchValue(data);
              break;
            case 'fundAndExpensesForm':
              this.fundAndExpensesForm.patchValue(data);
              break;
            default:
              break;
          }
        }

      }

    })

    if (localStorage.getItem('salaryForm')) {
      let data = JSON.parse(localStorage.getItem('salaryForm') as string)
      this.salaryForm.patchValue(data)
    }

    if (localStorage.getItem('fundAndExpensesForm')) {
      let data = JSON.parse(localStorage.getItem('fundAndExpensesForm') as string)
      this.fundAndExpensesForm.patchValue(data)
    }
  }

  resetAllForms(){
    this.investForm.reset()
    // this.salaryForm.reset()
    this.fundAndExpensesForm.reset()
    localStorage.removeItem('investForm')
    localStorage.removeItem('salaryForm')
    localStorage.removeItem('fundAndExpensesForm')
  }

  addItem(form: FormGroup, fieldName: string, ...args: (HTMLInputElement | HTMLSelectElement)[]) {
    let newVal: any = {}
    for (const arg of args) {
      if (arg.value == '') {
        return
      } else {
        newVal[arg.name] = arg.value
      }
    }
    args.map(arg => arg.value = '')

    // حذف مورد پیشفرض با مقادیر خالی
    form.controls[fieldName]!.value[0]?.title == '' ? form.value[fieldName].splice(0, 1) : ''

    form.value[fieldName].push(newVal)
    form.controls[fieldName].setErrors(null)

  }

  removeItem(el: number, list: FormArray) {
    (<any>list).splice(el, 1)
  }

  orderbyValueAsc = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return a.key > b.key ? -1 : (a.key > b.key) ? 0 : 1
  }

  formSubmit(form: FormGroup, formName: string) {
    this.submitted = true
    if (form.invalid) {
      this.msg.sendMessage('لطفا موارد خواسته شده را به دقت تکمیل نمایید.', 'warning')
      return
    }

    this.submitted = false

    let expireTime = Date.now() + 24 * 60 * 60 * 1000;
    let initValues = form.value
    let vals: any = { ...initValues, expire: expireTime }
    localStorage.setItem(formName, JSON.stringify(vals))

  }

  saveAndEstimate() {
    this.submitted = true
    if (this.investForm.invalid || this.salaryForm.invalid || this.fundAndExpensesForm.invalid) {
      this.submitted = false
      return
    }

    if (!this.userService.getPlansBalance().length) {
      
    }

    let data = {
      investForm: this.investForm.value,
      salaryForm: this.salaryForm.value,
      fundAndExpensesForm: this.fundAndExpensesForm.value
    }

    this.projacts.newProjact(data).pipe(
      map(res => res as SuccessHandle),
      take(1)
    ).subscribe(res => {
      this.submitted = false
      this.msg.sendMessage('مقادیر با موفقیت پردازش و ذخیره گردید.', 'success');
    })

  }

  userHasActivePlan(){
    return this.userService.getPlansBalance().length? true : false
  }
  
  estehlakHarSal(type: any, item: any, year: number): IEstehlak {
    let value = item
    let data: any;

    const calculate = (arzeshDaftari: number, years: number) => {
      let e = {
        year: year - years,
        estehlak: Math.round(arzeshDaftari * this.rate[type as keyof IRate] / 100),
        get arzeshDaftari() {
          return arzeshDaftari - this.estehlak
        }
      }
      if (years != 0) {
        calculate(e.arzeshDaftari, years - 1)
      } else {
        data = e
      }
    };

    let totalCost = this.justNum(value.count) * this.justNum(value.cost)
    calculate(totalCost, year - 1)

    return data;
  }

  maintenanceCost(type: HTMLInputElement) {
    // let sum = this.estimate.investForm[type as string]

    return type.value

  }

  justNum(x: any) {
    return +x.replace(/\D/g, "")
  }

  rateChanged(event: Event, type: any) {
    return this.rate[type as keyof IRate] = (<HTMLInputElement>event.target).valueAsNumber
  }

  rateValue(type: any) {
    return this.rate[type as keyof IRate]
  }
}

export interface IRate {
  building: number,
  equipment: number,
  vehicles: number,
  officeEquipment: number,
  preOperation: number,
  pishbiniNashode: number,
}
export interface IEstehlak {
  year: number,
  estehlak: number,
  arzeshDaftari: number
}