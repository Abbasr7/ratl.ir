import { Injectable, Renderer2 } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, lastValueFrom, map, Observable, retry, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MessagesService } from '../services/messages.service';
import { UserService } from '../services/user.service';
import { IUserInfo } from '../interfaces/interfaces';

@Injectable()
export class HttpInterceptorInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private msg:MessagesService,
    private router: Router ) { 
      
    }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('auth-token');
    const reqWhithHeaders = request.clone({
      setHeaders: {
        'x-auth': `${token}`
      }
    })

    return next.handle(reqWhithHeaders).pipe(
      
      catchError((error: HttpErrorResponse) => {
        if (error) {
          if (error.error.name == "TokenExpiredError") {
            this.msg.sendMessage('توکن شما منقضی شده لطفا دوباره وارد سایت شوید.','danger')
            this.auth.logOut()
            this.router.navigate(['/login'])
          } else if (error.error.name == "JsonWebTokenError") {
            this.msg.sendMessage(`dadash Shoma Ki bashi? ${error.error.name}`,'danger');
          } else if (error.status == 401) {
            this.msg.sendMessage('احراز هویت نشدید!','danger')
            this.auth.logOut()
            this.router.navigate(['/login'])
          } else if (error.status == 0) {
            console.log("Cannot Connect to server");
          }
        }
        return throwError(() => {
          this.msg.sendMessage(error.error.Error,'danger')
        });
      })
    );
  }

}
