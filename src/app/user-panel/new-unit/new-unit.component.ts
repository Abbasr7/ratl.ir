import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { KeyValue } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { IProjact, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ProjactsService } from 'src/app/controlers/services/projacts.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { customValidate, Spinner } from 'src/app/controlers/utils';

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
    private userService: UserService,
    private spinner: Spinner,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  editId = this.route.snapshot.paramMap.get('id');
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

  createFormGroup(type: string):FormGroup {
    switch (type) {
      case 'invest':
        return this.fb.group({
          title: [''],
          count: [''],
          cost: ['']
        })
        break;
      case 'jobTitles':
      case 'jobLevels':
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
        return this.fb.group({})
        break;
    }

  }

  assignData(...formNames: string[]) { // برای بازیابی آخرین اطلاعات وارد شده توسط کاربر
    
    if (this.editId) {
      this.projacts.getById(this.editId).pipe(
        map(response => response as SuccessHandle),
        map(res => res.data as IProjact),
        take(1)
      ).subscribe({
        next: res => {

          this.setFormArray(res,'landscaping','building','equipment','vehicles','officeEquipment','jobTitles', 'jobLevels', 'employees','mavadAvalie')
          this.investForm.patchValue(res.investForm);
          this.fundAndExpensesForm.patchValue(res.fundAndExpensesForm);
          this.salaryForm.patchValue(res.salaryForm);
          
        }
      })
    } else {
      
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
          } else {
            this.resetAllForms()
          }
  
        }
  
      })
    }

    // if (localStorage.getItem('salaryForm')) {
    //   let data = JSON.parse(localStorage.getItem('salaryForm') as string)
    //   this.salaryForm.patchValue(data)
    // }

    // if (localStorage.getItem('fundAndExpensesForm')) {
    //   let data = JSON.parse(localStorage.getItem('fundAndExpensesForm') as string)
    //   this.fundAndExpensesForm.patchValue(data)
    // }
  }

  getFormArray(form:FormGroup,key:string){
    return form.get(key) as FormArray
  }

  setFormArray(object:any,...args:string[]){
    let invest = ['landscaping','building','equipment','vehicles','officeEquipment']
    let salary = ['jobTitles', 'jobLevels', 'employees']
    args.forEach(arg => {

      if (invest.includes(arg)) {

        this.getFormArray(this.investForm,arg).removeAt(0)
        object.investForm[arg].forEach((item:any) => {
          this.getFormArray(this.investForm,arg).push(this.createFormGroup('invest'))
        });

      } else if (salary.includes(arg)) {

        this.getFormArray(this.salaryForm,arg).removeAt(0)
        object.salaryForm[arg].forEach((item:any) => {
            this.getFormArray(this.salaryForm,arg).push(this.createFormGroup(arg))
        });

      } else if (arg == 'mavadAvalie') {

        this.getFormArray(this.fundAndExpensesForm,arg).removeAt(0)
        object.fundAndExpensesForm[arg].forEach((item:any) => {
            this.getFormArray(this.fundAndExpensesForm,arg).push(this.createFormGroup(arg))
        });

      }
    })
  }

  resetAllForms() {
    localStorage.removeItem('investForm')
    localStorage.removeItem('salaryForm')
    localStorage.removeItem('fundAndExpensesForm')
    this.investForm.reset()
    // this.salaryForm.reset()
    this.fundAndExpensesForm.reset()
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

    this.spinner.addSpinner('#estimate')

    let data = {
      investForm: this.investForm.value,
      salaryForm: this.salaryForm.value,
      fundAndExpensesForm: this.fundAndExpensesForm.value
    }

    let action = this.editId? this.projacts.update(this.editId,data) : this.projacts.newProjact(data);

    action.pipe(
      map(res => res as SuccessHandle),
      map(res => res.data as IProjact),
      take(1)
    ).subscribe({
      next: res => {
        this.submitted = false
        this.msg.sendMessage('مقادیر با موفقیت پردازش و ذخیره گردید.', 'success');
        this.spinner.removeSpinner('#estimate');
        this.projacts.projact.next(res)
        this.router.navigate(['/panel/estimate/' + res._id],{state:{newForm: 'yes'}})
      },
      error: err => {
        this.spinner.removeSpinner('#estimate')
      }
    })

  }

  userHasActivePlan() {
    return this.userService.getPlansBalance().length ? true : false
  }

}