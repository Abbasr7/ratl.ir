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
import { UserProjactsComponent } from './user-panel/user-projacts/user-projacts.component';

const routes: Routes = [
  {path:'', component:HomeComponent,children:[
    {path:'',component:MainPageComponent},
    {path:'cart/:id',component:CartComponent,canActivate:[CartResolveGuard],data:{title: '???????? ????????????'}},
    {path:'pay/verify',component:VerifyComponent,data:{title: '?????????? ????????????'}},
    {path:'page/:title',component:ShowPageComponent},
    {path:'plans',component:ShowPlansComponent,data:{type:'single-page'}},
  ]},
  {path:'admin', component:AdminComponent,children:[
    {path:'plans', component:PlansComponent,data:{title: '???????????? ?????? ????',access:'plans'},canActivate:[AdminGuard]},
    {path:'plans/newplan', component:NewPlanComponent,data:{title: '?????????? ?????? ????????',access:'plans'},canActivate:[AdminGuard]},
    {path:'plans/edit/:id', component:NewPlanComponent,data:{title: '???????????? ??????',access:'plans'},canActivate:[AdminGuard]},
    {path:'users', component:UsersComponent,data:{title: '???????????? ??????????????',access:'users'},canActivate:[AdminGuard]},
    {path:'user/:id', component:ProfileComponent,data:{admin:true,title:'???????????? ??????????',access:'users'},canActivate:[AdminGuard]},
    {path:'roles', component:RolesComponent,data:{title: '???????????? ??????????',access:'roles'},canActivate:[AdminGuard]},
    {path:'menus',component:MenusComponent,data:{title: '???????????? ??????????????',access:'menus'},canActivate:[AdminGuard]},
    {path:'settings', component:SettingComponent,data:{title: '?????????????? ????????',access:'settings'},canActivate:[AdminGuard]},
    {path:'pages', component:PagesComponent,data:{title: '???????????? ??????????',access:'pages'},canActivate:[AdminGuard]},
    {path:'pages/new', component:NewPageComponent,data:{title: '?????????? ???????? ????????',access:'pages'},canActivate:[AdminGuard]},
    {path:'pages/edit/:title', component:NewPageComponent,data:{title: '???????????? ????????',access:'pages'},canActivate:[AdminGuard]},
    {path:'payments', component:PaymentsComponent,data:{title: '????????????????',access:'payments'},canActivate:[AdminGuard]},
  ],canActivate:[AdminGuard], data:{title: '???????????? ',access:'admin'}},
  {path:'panel', component:UserPanelComponent,canActivate:[AuthGuard],children:[
    {path:'profile',component:ProfileComponent,data:{title: '????????????'}},
    {path:'newunit',component:NewUnitComponent,data:{title: '?????????? ?????????? ????????'}},
    {path:'editunit/:id',component:NewUnitComponent,data:{title: '???????????? ??????????'}},
    {path:'payments',component:PricedPlansComponent,data:{title: '???????? ????????????????'}},
    {path:'projacts',component:UserProjactsComponent,data:{title: '???????? ?????????? ????'}},
    {path:'estimate/:id',component:EstimateComponent,data:{title: '?????????? ?????????? ???????? ????????'}},
  ],data:{title: '???????? ????????????'}},
  {path:'register', component:RegisterComponent,canActivate:[LoginGuard],data:{title: '?????? ??????'}},
  {path:'init/register', component:RegisterComponent,canActivate:[InitAppGuard],data:{title: '?????? ???????????? ??????????'}},
  {path:'login', component:LoginComponent,canActivate:[LoginGuard],data:{title: '????????'}},
  {path:'logout', component:LogoutComponent,data:{title: '????????'}},
  {path:'not-found',component:NotFoundComponent,data:{title: '???????? ?????????????? ???????? ??????!'}},
  {path:'**', redirectTo:'not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
