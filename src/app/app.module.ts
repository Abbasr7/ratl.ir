import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { HttpInterceptorInterceptor } from './controlers/interceptors/http-interceptor.interceptor';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { UserPanelComponent } from './user-panel/user-panel.component';
import { RegisterComponent } from './user-panel/register/register.component';
import { LoginComponent } from './user-panel/login/login.component';
import { HeaderComponent } from './home/header/header.component';
import { ProfileComponent } from './user-panel/profile/profile.component';
import { NewPlanComponent } from './admin/plans/new-plan/new-plan.component';
import { CartComponent } from './shoping/cart/cart.component';
import { MainPageComponent } from './home/main-page/main-page.component';
import { LoginFormComponent } from './user-panel/login/login-form/login-form.component';
import { RegisterFormComponent } from './user-panel/register/register-form/register-form.component';
import { VerifyComponent } from './shoping/verify/verify.component';
import { FooterComponent } from './home/footer/footer.component';
import { HeroComponent } from './home/hero/hero.component';
import { SettingComponent } from './admin/setting/setting.component';
import { UsersComponent } from './admin/users/users.component';
import { NotFoundComponent } from './home/not-found/not-found.component';
import { RolesComponent } from './admin/roles/roles.component';
import { AssignRolesComponent } from './admin/roles/assign-roles/assign-roles.component';
import { MenusComponent } from './admin/menus/menus.component';
import { ShowMenusComponent } from './home/header/show-menus/show-menus.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollToDirective } from './controlers/directives/scroll-to.directive';
import { PlansComponent } from './admin/plans/plans.component';
import { PricedPlansComponent } from './user-panel/priced-plans/priced-plans.component';
import { UserProjactsModule } from './modules/user-projacts/user-projacts.module';
import { PagesComponent } from './admin/pages/pages.component';
import { NewPageComponent } from './admin/pages/new-page/new-page.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PaymentsComponent } from './admin/payments/payments.component';
import { ShowPageComponent } from './home/show-page/show-page.component';
import { LogoutComponent } from './user-panel/logout/logout.component';
import { SharedModule } from './modules/shared/shared.module';
import { EstimateComponent } from './user-panel/estimate/estimate.component';
import { ShowPlansComponent } from './home/plans/show-plans.component';
import { SalaryFormComponent } from './user-panel/estimate/salary-form/salary-form.component';
import { DepreciationsComponent } from './user-panel/estimate/depreciations/depreciations.component';
import { WorkingCapitalComponent } from './user-panel/estimate/working-capital/working-capital.component';
import { BankFacilitiesComponent } from './user-panel/estimate/bank-facilities/bank-facilities.component';

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
    NotFoundComponent,
    RolesComponent,
    AssignRolesComponent,
    MenusComponent,
    ShowMenusComponent,
    PricedPlansComponent,
    PagesComponent,
    NewPageComponent,
    PaymentsComponent,
    ShowPageComponent,
    LogoutComponent,
    ScrollToDirective,
    EstimateComponent,
    ShowPlansComponent,
    SalaryFormComponent,
    DepreciationsComponent,
    WorkingCapitalComponent,
    BankFacilitiesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    OrderModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    UserProjactsModule,
    AngularEditorModule,
    SharedModule
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS, useClass:HttpInterceptorInterceptor, multi:true},
    {provide:JWT_OPTIONS, useValue:JWT_OPTIONS},JwtHelperService,
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
