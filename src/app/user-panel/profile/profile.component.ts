import { HttpErrorResponse } from '@angular/common/http';
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, Subscription, take, throwError } from 'rxjs';
import { IRole, IUser, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { ServerService } from 'src/app/controlers/services/server.service';
import { UserService } from 'src/app/controlers/services/user.service';
import { customValidate, Spinner } from 'src/app/controlers/utils';
import { Globals } from 'src/app/globals';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy, DoCheck {

  readonly isAdmin = this.route.snapshot.data['admin']

  constructor(private route: ActivatedRoute, private router: Router,
    private server: ServerService, private userService: UserService,
    private formBuilder: FormBuilder, private msg: MessagesService,
    private customValidator:customValidate, private spinner:Spinner) { }

  apiUrl: string = Globals.apiUrl;
  subscribe: Subscription;
  editSubscribe: Subscription;

  loading: boolean = false;
  userId: string = this.router.url == '/panel/profile'?this.userService.decodeToken().id: this.route.snapshot.params['id'];
  user: IUser;
  roles:IRole[];
  previewImgUrl: any;
  avatar: string = '/assets/img/profile-pic.png';
  file: File;
  emptyfile: File;
  phonePattern: string = '09(0[1-2]|1[0-9]|3[0-9]|2[0-1])-?[0-9]{3}-?[0-9]{4}';
  profileForm: FormGroup = this.formBuilder.group({
    _id: ['', Validators.required],
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fullname: [''],
    phone: ['', [Validators.minLength(11), Validators.maxLength(11), Validators.pattern(this.phonePattern)]],
    address: [''],
    imgurl: [''],
    newImg: ['']
  })
  changePasswordForm: FormGroup = this.formBuilder.group({
    newPassword: ['', [Validators.required]],
    confirmNewPassword: ['', [Validators.required]],
    currentPassword: ['', Validators.required],
  },{validators:this.customValidator.checkMatchingPasswords('newPassword','confirmNewPassword')})

  ngOnInit(): void {
    
    this.subscribe = this.server.get(`/user/userinfo?type=all&id=${this.userId}`).pipe(
      map(val => val as SuccessHandle)
    ).subscribe((res) => {
      this.assignData(res.data.user);
    })

  }

  ngDoCheck() {
    // ???????? ???? ???????? ?????????????? ?????????? ?????? ???? ??????
    let changed: boolean = false;

    for (let prop in this.profileForm.value) {
      if (this.isDifferent(this.profileForm.value, prop)) {
        changed = true
        this.profileForm.markAsDirty()
      }
    }
    if (!changed) {
      this.profileForm.markAsPristine()
    }
  }

  assignData(res: any) {
    this.user = res;
    this.profileForm.patchValue({
      _id: res._id,
      username: res.username,
      email: res.email,
      fullname: res.fullname,
      phone: res.phone ? res.phone : '',
      address: res.address,
      imgurl: res.imgurl
    })
    this.createReference(this.profileForm)
  }
  // ???????????? ?????? ??????????????
  get f() {
    return this.profileForm.controls
  }
  // ???????????? ?????? ?????????? ??????????
  get f2() {
    return this.changePasswordForm.controls
  }
  // ???????? ?????? ?????????? ?????????? ???????????? ??????
  imageUrl(event: any) {
    this.file = event.target.files[0]
    let reader = new FileReader()
    reader.onload = res => this.previewImgUrl = reader.result
    reader.readAsDataURL(this.file)
  }
  // ?????? ?????????? ???????????? ??????
  resetImg() {
    this.file = this.emptyfile
    this.previewImgUrl = '';
    this.profileForm.patchValue({
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
    for (let prop in this.profileForm.value) {
      if (this.isDifferent(this.profileForm.value, prop)) { hasChanges = true; }
    }
    // If no changes, cancel form submition
    if (!hasChanges && this.file == null) {
      this.profileForm.markAsPristine()
      return;
    }
    if (this.profileForm.invalid) {
      this.msg.sendMessage('?????????? ???????????? ?????? ???? ???????????? ???????? ????????????','warning')
      return
    }
    this.loading = true

    this.editSubscribe = this.userService.editUser(this.profileForm.value, this.file).pipe(
      map(i => i as SuccessHandle),
      catchError((error: HttpErrorResponse) => {
        this.loading = false
        return throwError(() => of(error))
      }),
      take(1)
    )
    .subscribe((res) => {
      this.subscribe.unsubscribe()
      this.assignData(res.data)
      this.resetImg()
      this.loading = false
      this.profileForm.markAsPristine()
      this.userService.userInfo.next({...this.userService.userInfo.value,user:res.data})

      this.msg.sendMessage('?????????????? ???? ???????????? ?????????? ????????.','success')
    })
  }

  changePasswordErrorMessages:any
  changePassword(){
    this.changePasswordErrorMessages = this.customValidator.isValidMessages(this.f2)

    if (this.changePasswordForm.invalid) {
      return
    }
    // ???????? ?????????? ?????????????? ?????????? ???????? ???????? ????????
    if (this.isAdmin) {
      this.changePasswordForm.value.admin = true;
    }
    this.changePasswordForm.value.userid = this.userId;

    this.userService.changePassword(this.changePasswordForm.value).subscribe(res => {})
    
  }

  ngOnDestroy() {
    this.subscribe.unsubscribe()
    this.editSubscribe?this.editSubscribe.unsubscribe():''
  }
}
