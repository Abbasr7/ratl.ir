import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { SettingsService } from 'src/app/controlers/services/settings.service';
import { Spinner } from 'src/app/controlers/utils';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  apiUrl = Globals.apiUrl
  constructor(private fb: FormBuilder,
    private settings: SettingsService,
    private msg: MessagesService,
    private spinner: Spinner) { }

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    logo: [''],
    metatags: [''],
    description: [''],
    keywords: [''],
    footer: this.fb.group({
      social: this.fb.group({
        telegram: [''],
        instagram: [''],
        twitter: [''],
        linkedin: [''],
        github: ['']
      }),
      extraHtml: [''],
      description: ['']
    })
  });
  logo: File;
  emptyFile: File;
  previewImgUrl: any
  items: any[] = []
  loading:boolean = false

  ngOnInit(): void {
    this.assignData()
  }

  async assignData(){
    let res = await this.settings.getSettings()
    this.form.patchValue(res)
    this.form.value.metatags? this.items = this.form.value.metatags:'';
    this.form.value.logo && this.form.value.logo != 'null'?
     this.previewImgUrl = this.apiUrl + this.form.value.logo:'';
  }

  addItem(name: HTMLInputElement, content: HTMLInputElement, $event: Event) {
    $event.preventDefault()
    let newVal = {
      name: name.value,
      content: content.value
    }
    if (name.value && content.value) {
      this.items.push(newVal)
    } else {
      return
    }
    this.form.patchValue({
      metatags: this.items,
    })
    this.form.controls['metatags'].markAsDirty()
    name.value = '';
    content.value = ''
  }

  removeItem(el: number) {
    this.items.splice(el, 1)
    this.form.patchValue({ metatags: this.items })
    this.form.controls['metatags'].markAsDirty()
  }

  // برای پیش نمایش تصویر انتخاب شده
  imageUrl(event: any) {
    this.logo = event.target.files[0]
    this.form.patchValue({
      logo: this.logo
    })
    this.form.controls['logo'].markAsDirty()
    let reader = new FileReader()
    reader.onload = res => this.previewImgUrl = reader.result
    reader.readAsDataURL(this.logo)
  }
  // حذف تصویر انتخاب شده
  resetImg() {
    this.logo = this.emptyFile
    this.previewImgUrl = '';
    this.form.patchValue({
      logo: 'null'
    })
    this.form.controls['logo'].markAsDirty()
  }

  getChangedValues(form: any) {
    let dirtyValues: any = {};

    Object.keys(form.controls)
      .forEach(key => {
        let currentControl = form.controls[key];

        if (currentControl.dirty) {
          if (currentControl.controls)
            dirtyValues[key] = this.getChangedValues(currentControl);
          else
            dirtyValues[key] = currentControl.value;
        }
      });

    return dirtyValues;
  }

  saveForm(){
    this.loading = true
    this.spinner.addSpinner('#saveChanges')
    let data = this.form.value
    let changedData = this.getChangedValues(this.form)
    if (!data) {
      this.loading = false
    }
    
    let formData = new FormData()
    this.convertToFormData(data,formData)
    Object.prototype.hasOwnProperty.call(changedData, 'logo')?
     formData.set('logo',data.logo): formData.delete('logo');

    this.settings.updateSettings(formData).pipe(
      take(1)
    ).subscribe({
        next:(res) => {
          this.loading = false;
          this.spinner.removeSpinner('#saveChanges');
          this.spinner.addSuccessIcon('#scs-btn');
          this.msg.sendMessage('تغییرات با موفقیت ذخیره شدند.','success');
          this.settings.setSettings()
        },
        error:(err) => {
          this.loading = false;
          this.spinner.removeSpinner('#saveChanges');
          this.msg.sendMessage(err.message,'danger')
        }
    })
  }

  createFormData:any
  convertToFormData(data:any,formData:FormData){
    this.createFormData = function(obj:any, subkey:any = '') {
      for (const key in obj) {
        let subKeyStr = subkey? subkey+'['+key+']': key

        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (typeof obj[key] === 'object') {
            this.createFormData(obj[key],subKeyStr)
          }else{
            formData.append(subKeyStr, obj[key])
          }
        }
      }
    }

    this.createFormData(data)
  }
}
