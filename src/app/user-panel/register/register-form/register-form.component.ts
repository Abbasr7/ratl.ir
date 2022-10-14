import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { AuthService } from 'src/app/controlers/services/auth.service';
import { customValidate, Spinner } from 'src/app/controlers/utils';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterFormComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private msg: MessagesService,
    private spinner: Spinner,
    private cValidator:customValidate) { }

  registerUrl = 'register'
  currentUrl: string = this.router.url
  loading: boolean = false;
  submitted: boolean = false;
  usernamePattern = '^[a-zA-Z0-9_ ]*$'
  validateMsg:any
  form: FormGroup = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(4)]],
    username: ['', [Validators.required, Validators.minLength(4),Validators.pattern(this.usernamePattern)]],
    email: ['', [Validators.required, Validators.email, Validators.minLength(8)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() {
    this.registerUrl = this.currentUrl
  }
  get f() {
    return this.form.controls
  }

  register() {
    this.spinner.addSpinner('#btn')
    this.submitted = true;
    this.validateMsg = this.cValidator.isValidMessages(this.f)

    if (this.form.invalid) {
      this.spinner.removeSpinner('#btn')
      return
    }

    this.authService.Register(this.form.value, this.registerUrl).pipe(
      catchError((e) => {
        this.spinner.removeSpinner('#btn')
        return of('e')
      })
    ).subscribe(res => {
      this.spinner.removeSpinner('#btn')
      localStorage.setItem('auth-token',res.data)
      if (res == 'e') {
        this.msg.sendMessage('ثبت نام ناموفق بود دوباره تلاش کنید.', 'danger')
      } else {
        this.msg.sendMessage('راه اندازی اولیه سایت و ثبت نام با موفقیت انجام شد.', 'success')
        this.router.navigate([this.authService.redirectUrl?this.authService.redirectUrl:'/'])
      }
    })
  }

}
