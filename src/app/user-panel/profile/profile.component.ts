import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, Subscription, throwError } from 'rxjs';
import { IUser, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy, DoCheck {

  constructor(private route: ActivatedRoute, private router: Router,
    private server: ServerService, private userService: UserService,
    private formBuilder: FormBuilder, private msg: MessagesService) { }

  apiUrl: string = Globals.apiUrl;
  subscribe: Subscription;
  editSubscribe: Subscription;
  loading: boolean = false;
  userId: string = this.router.url == '/panel/profile'?this.userService.decodeToken().id: this.route.snapshot.params['id'];
  user: any;
  previewImgUrl: any;
  avatar: string = '/assets/img/profile-pic.png';
  file: File;
  emptyfile: File;
  phonePattern: string = '09(0[1-2]|1[0-9]|3[0-9]|2[0-1])-?[0-9]{3}-?[0-9]{4}';
  form: FormGroup = this.formBuilder.group({
    _id: ['', Validators.required],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fullname: [''],
    phone: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern(this.phonePattern)]],
    address: [''],
    imgurl: [''],
    newImg: ['']
  })

  ngOnInit(): void {
    
    this.subscribe = this.server.get(`/user/userinfo?id=${this.userId}`).pipe(
      map(val => val as SuccessHandle)
    ).subscribe((res) => {
      this.assignData(res.data.user);
    })
  }

  ngDoCheck() {
    let changed: boolean = false;

    for (let prop in this.form.value) {
      if (this.isDifferent(this.form.value, prop)) {
        changed = true
        this.form.markAsDirty()
      }
    }
    if (!changed) {
      this.form.markAsPristine()
    }
  }

  assignData(res: any) {
    this.user = res;
    this.form.patchValue({
      _id: res._id,
      username: res.username,
      email: res.email,
      fullname: res.fullname,
      phone: res.phone ? res.phone : '',
      address: res.address,
      imgurl: res.imgurl
    })
    this.createReference(this.form)
  }
  get f() {
    return this.form.controls
  }
  imageUrl(event: any) {
    this.file = event.target.files[0]
    let reader = new FileReader()
    reader.onload = res => this.previewImgUrl = reader.result
    reader.readAsDataURL(this.file)
  }
  resetImg() {
    this.file = this.emptyfile
    this.previewImgUrl = '';
    this.form.patchValue({
      newImg: ''
    })
  }

  // Creates a reference of your initial value
  referenceForm: any;
  createReference(form: any) {
    this.referenceForm = Object.assign({}, form.value);
  }

  // Returns true if the user has changed the value in the form
  isDifferent(obj: any, prop: string) {
    return this.referenceForm[prop] !== obj[prop];
  }
  editUser() {
    let hasChanges = false;
    for (let prop in this.form.value) {
      if (this.isDifferent(this.form.value, prop)) { hasChanges = true; }
    }
    // If no changes, cancel form submition
    if (!hasChanges && this.file == null) {
      this.form.markAsPristine()
      return;
    }
    if (this.form.invalid) {
      this.msg.sendMessage('موارد خواسته شده را بدرستی وارد نمایید','warning')
      return
    }
    this.loading = true

    this.editSubscribe = this.userService.editUser(this.form.value, this.file).pipe(
      map(i => i as SuccessHandle),
      catchError((error: HttpErrorResponse) => {
        this.loading = false
        return throwError(() => of(error))
      }),
    )
    .subscribe((res) => {
      this.subscribe.unsubscribe()
      this.assignData(res.data)
      this.resetImg()
      this.loading = false
      this.form.markAsPristine()
      this.userService.userInfo.next({...this.userService.userInfo.value,user:res.data})

      this.msg.sendMessage('تغییرات با موفقیت ذخیره شدند.','success')
    })
  }
  ngOnDestroy() {
    this.subscribe.unsubscribe()
    this.editSubscribe?this.editSubscribe.unsubscribe():''
  }
}
