import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { AuthService } from 'src/app/controlers/services/auth.service';
import { customValidate, Spinner } from 'src/app/controlers/utils';
import { UserService } from 'src/app/controlers/services/user.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  constructor(
    private fb:FormBuilder,
    private router:Router,
    private authService:AuthService,
    private spinner:Spinner,
    private msg:MessagesService,
    private cValidator:customValidate,
    private user:UserService
    ) { }

  
  @Input() redirect:string
  
  loading: boolean = false;
  submitted: boolean = false
  form: FormGroup = this.fb.group({
    username: ['',[Validators.required,Validators.minLength(4)]],
    password: ['',[Validators.required,Validators.minLength(6)]]
  });
  validateMsg:any;

  ngOnInit() {
  }

  get f(){
    return this.form.controls
  }

  logIn(){  
    this.submitted = true;
    this.validateMsg = this.cValidator.isValidMessages(this.f)

    this.spinner.addSpinner('#btn')
    if(this.form.invalid){
      this.spinner.removeSpinner('#btn')
      return
    }

    this.authService.Login(this.form.value).pipe(
      map(res => res as SuccessHandle)
    ).subscribe( {
      next: (res) =>{
        this.spinner.removeSpinner('#btn')
        localStorage.setItem('auth-token',res.data)
        this.authService.loggedIn = true
        this.user.setUserInfo()
        this.msg.sendMessage('ورود موفقیت آمیز بود.خوش آمدید.','success')
        if (this.redirect == 'self') {
          location.reload()
        } else {
          this.router.navigate([this.authService.redirectUrl?`/${this.authService.redirectUrl}`:'/'])
        }
      },
      error:(err) =>{
        console.log(err);
        this.spinner.removeSpinner('#btn')
      }
    })
  }
}
