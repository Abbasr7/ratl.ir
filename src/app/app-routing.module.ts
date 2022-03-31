import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { NewPlanComponent } from './admin/new-plan/new-plan.component';
import { AuthGuard } from './controlers/guards/auth.guard';
import { CartResolveGuard } from './controlers/guards/cart-resolve.guard';
import { InitAppGuard } from './controlers/guards/init-app.guard';
import { LoginGuard } from './controlers/guards/login.guard';
import { HomeComponent } from './home/home.component';
import { MainPageComponent } from './home/main-page/main-page.component';
import { CartComponent } from './shoping/cart/cart.component';
import { VerifyComponent } from './shoping/verify/verify.component';
import { LoginComponent } from './user-panel/login/login.component';
import { NewUnitComponent } from './user-panel/new-unit/new-unit.component';
import { ProfileComponent } from './user-panel/profile/profile.component';
import { RegisterComponent } from './user-panel/register/register.component';
import { UserPanelComponent } from './user-panel/user-panel.component';

const routes: Routes = [
  {path:'', component:HomeComponent,children:[
    {path:'',component:MainPageComponent},
    {path:'cart/:id',component:CartComponent,canActivate:[CartResolveGuard]},
    {path:'pay/verify/',component:VerifyComponent}
  ]},
  {path:'admin', component:AdminComponent,children:[
    {path:'newplan', component:NewPlanComponent}
  ]},
  {path:'panel', component:UserPanelComponent,canActivate:[AuthGuard],children:[
    {path:'profile',component:ProfileComponent},
    {path:'newunit',component:NewUnitComponent}
  ]},
  {path:'register', component:RegisterComponent,canActivate:[LoginGuard]},
  {path:'init/register', component:RegisterComponent,canActivate:[InitAppGuard]},
  {path:'login', component:LoginComponent,canActivate:[LoginGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
