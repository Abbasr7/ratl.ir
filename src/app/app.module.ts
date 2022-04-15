import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { HttpInterceptorInterceptor } from './controlers/interceptors/http-interceptor.interceptor';
import { UserPanelComponent } from './user-panel/user-panel.component';
import { RegisterComponent } from './user-panel/register/register.component';
import { LoginComponent } from './user-panel/login/login.component';
import { HeaderComponent } from './home/header/header.component';
import { ProfileComponent } from './user-panel/profile/profile.component';
import { NewUnitComponent } from './user-panel/new-unit/new-unit.component';
import { NewPlanComponent } from './admin/new-plan/new-plan.component';
import { PlansComponent } from './home/plans/plans.component';
import { CartComponent } from './shoping/cart/cart.component';
import { MainPageComponent } from './home/main-page/main-page.component';
import { LoginFormComponent } from './user-panel/login/login-form/login-form.component';
import { RegisterFormComponent } from './user-panel/register/register-form/register-form.component';
import { VerifyComponent } from './shoping/verify/verify.component';
import { FooterComponent } from './home/footer/footer.component';
import { HeroComponent } from './home/hero/hero.component';
import { SettingComponent } from './admin/setting/setting.component';
import { UsersComponent } from './admin/users/users.component';
import { ModalDirective } from './controlers/directives/modal.directive';
import { NotFoundComponent } from './home/not-found/not-found.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { RolesComponent } from './admin/roles/roles.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AdminComponent,
    SidebarComponent,
    UserPanelComponent,
    RegisterComponent,
    LoginComponent,
    HeaderComponent,
    ProfileComponent,
    NewUnitComponent,
    NewPlanComponent,
    PlansComponent,
    CartComponent,
    MainPageComponent,
    LoginFormComponent,
    RegisterFormComponent,
    VerifyComponent,
    FooterComponent,
    HeroComponent,
    SettingComponent,
    UsersComponent,
    ModalDirective,
    NotFoundComponent,
    RolesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OrderModule
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS, useClass:HttpInterceptorInterceptor, multi:true},
    {provide:JWT_OPTIONS, useValue:JWT_OPTIONS},JwtHelperService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
