import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { MenusComponent } from './admin/menus/menus.component';
import { NewPageComponent } from './admin/pages/new-page/new-page.component';
import { PagesComponent } from './admin/pages/pages.component';
import { PaymentsComponent } from './admin/payments/payments.component';
import { NewPlanComponent } from './admin/plans/new-plan/new-plan.component';
import { PlansComponent } from './admin/plans/plans.component';
import { RolesComponent } from './admin/roles/roles.component';
import { SettingComponent } from './admin/setting/setting.component';
import { UsersComponent } from './admin/users/users.component';
import { AdminGuard } from './controlers/guards/admin.guard';
import { AuthGuard } from './controlers/guards/auth.guard';
import { CartResolveGuard } from './controlers/guards/cart-resolve.guard';
import { InitAppGuard } from './controlers/guards/init-app.guard';
import { LoginGuard } from './controlers/guards/login.guard';
import { HomeComponent } from './home/home.component';
import { MainPageComponent } from './home/main-page/main-page.component';
import { NotFoundComponent } from './home/not-found/not-found.component';
import { ShowPlansComponent } from './home/plans/show-plans.component';
import { ShowPageComponent } from './home/show-page/show-page.component';
import { CartComponent } from './shoping/cart/cart.component';
import { VerifyComponent } from './shoping/verify/verify.component';
import { EstimateComponent } from './user-panel/estimate/estimate.component';
import { LoginComponent } from './user-panel/login/login.component';
import { LogoutComponent } from './user-panel/logout/logout.component';
import { NewUnitComponent } from './user-panel/new-unit/new-unit.component';
import { PricedPlansComponent } from './user-panel/priced-plans/priced-plans.component';
import { ProfileComponent } from './user-panel/profile/profile.component';
import { RegisterComponent } from './user-panel/register/register.component';
import { UserPanelComponent } from './user-panel/user-panel.component';

const routes: Routes = [
  {path:'', component:HomeComponent,children:[
    {path:'',component:MainPageComponent},
    {path:'cart/:id',component:CartComponent,canActivate:[CartResolveGuard],data:{title: 'خرید اشتراک'}},
    {path:'pay/verify',component:VerifyComponent,data:{title: 'تایید پرداخت'}},
    {path:'page/:title',component:ShowPageComponent},
    {path:'plans',component:ShowPlansComponent,data:{type:'single-page'}},
  ]},
  {path:'admin', component:AdminComponent,children:[
    {path:'plans', component:PlansComponent,data:{title: 'مدیریت پلن ها',access:'plans'},canActivate:[AdminGuard]},
    {path:'plans/newplan', component:NewPlanComponent,data:{title: 'ایجاد پلن جدید',access:'plans'},canActivate:[AdminGuard]},
    {path:'plans/edit/:id', component:NewPlanComponent,data:{title: 'ویرایش پلن',access:'plans'},canActivate:[AdminGuard]},
    {path:'users', component:UsersComponent,data:{title: 'مدیریت کاربران',access:'users'},canActivate:[AdminGuard]},
    {path:'user/:id', component:ProfileComponent,data:{admin:true,title:'ویرایش کاربر',access:'users'},canActivate:[AdminGuard]},
    {path:'roles', component:RolesComponent,data:{title: 'مدیریت نقشها',access:'roles'},canActivate:[AdminGuard]},
    {path:'menus',component:MenusComponent,data:{title: 'مدیریت فهرستها',access:'menus'},canActivate:[AdminGuard]},
    {path:'settings', component:SettingComponent,data:{title: 'تنظیمات سایت',access:'settings'},canActivate:[AdminGuard]},
    {path:'pages', component:PagesComponent,data:{title: 'مدیریت صفحات',access:'pages'},canActivate:[AdminGuard]},
    {path:'pages/new', component:NewPageComponent,data:{title: 'ایجاد صفحه جدید',access:'pages'},canActivate:[AdminGuard]},
    {path:'pages/edit/:title', component:NewPageComponent,data:{title: 'ویرایش صفحه',access:'pages'},canActivate:[AdminGuard]},
    {path:'payments', component:PaymentsComponent,data:{title: 'پرداختها',access:'payments'},canActivate:[AdminGuard]},
  ],canActivate:[AdminGuard], data:{title: 'مدیریت ',access:'admin'}},
  {path:'panel', component:UserPanelComponent,canActivate:[AuthGuard],children:[
    {path:'profile',component:ProfileComponent,data:{title: 'مشخصات'}},
    {path:'newunit',component:NewUnitComponent,data:{title: 'ایجاد پروژه جدید'}},
    {path:'editunit/:id',component:NewUnitComponent,data:{title: 'ویرایش پروژه'}},
    {path:'payments',component:PricedPlansComponent,data:{title: 'لیست تراکنشها'}},
    {path:'estimate/:id',component:EstimateComponent,data:{title: 'نتیجه امکان سنجی مالی'}},
  ],data:{title: 'حساب کاربری'}},
  {path:'register', component:RegisterComponent,canActivate:[LoginGuard],data:{title: 'ثبت نام'}},
  {path:'init/register', component:RegisterComponent,canActivate:[InitAppGuard],data:{title: 'راه اندازی اولیه'}},
  {path:'login', component:LoginComponent,canActivate:[LoginGuard],data:{title: 'ورود'}},
  {path:'logout', component:LogoutComponent,data:{title: 'خروج'}},
  {path:'not-found',component:NotFoundComponent,data:{title: 'صفحه موردنظر پیدا نشد!'}},
  {path:'**', redirectTo:'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
