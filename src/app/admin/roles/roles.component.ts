import { HttpErrorResponse } from '@angular/common/http';
import { Component, ErrorHandler, OnInit } from '@angular/core';
import { NgForm,FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, map, Observable, ReplaySubject, Subscription, take, tap, throwError } from 'rxjs';
import { IRole, SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { ServerService } from 'src/app/controlers/services/server.service';
import { Globals } from 'src/app/globals';


@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  constructor(private server:ServerService) { }

  submited:boolean = false;
  loading:boolean = false;
  editMode:string = '';
  roles:IRole[] = [];
  subscribe: Subscription;
  accessVal:string[] = []; // to push access
  accessList:string[]
  admin:IRole
  exists:string ;
  rolesApi = Globals.adminApi

  form:FormGroup = new FormGroup({
    role: new FormControl('',[Validators.required]),
    access: new FormControl('',[Validators.required])
  })

  ngOnInit(): void {
    this.subscribe = this.server.get(this.rolesApi.getdata+'?type=role').pipe(
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe(res =>{
      this.roles = res.data
      this.admin = res.data.find((role:IRole) => role.nameid == "root-admin")
      this.accessList = this.admin.access
    })
    
  }
  

  get f(){
    return this.form.controls
  }

  saveNewRole(){
    this.submited = true;
    if (this.form.invalid) {
      return
    }
    this.loading = true
    let data = { title :this.form.value['role'], access: this.accessVal }

    this.server.create(this.rolesApi.createRole,data).pipe(
      catchError((error:HttpErrorResponse) =>{
        this.loading = false
        return throwError(()=> 'error')
      }),
      map(i => i as SuccessHandle),
      take(1)
    ).subscribe((res) =>{
      this.loading = false
      this.accessVal = []
      this.roles.push(res.data);
      console.log(this.roles);
    })
  }

  add(input:HTMLInputElement,$event:Event) {
    $event.preventDefault()

    let newVal = input.value
    !this.accessVal.includes(newVal) &&
    newVal && this.accessList.includes(newVal)? 
    this.accessVal.push(newVal):this.exists = newVal;
    input.value = '';

    setTimeout(() => {
      this.exists = ''
    }, 1000);

  }
  remove(el:number){
    this.accessVal.splice(el,1)
  }

  changeCheckbox($event:Event,roleNameid:string){

    let target = (<HTMLInputElement>$event.target)
    let role:any = this.roles.find(i => i.nameid == roleNameid)
    
    if (target.checked) {
      role.access.push(target.value)
    } else {
      let index = role.access.indexOf(target.value)
      role.access.splice(index,1)
    }

  }

  edit(nameid:string,flag:string){
    switch (flag) {
      case 'edit':
        this.editMode = nameid;
        break;
      case 'delete':
        let selected:any = this.roles.find((i:any) => i.role == nameid);
        this.server.delete(this.rolesApi.deleteRole+'?nameid='+nameid).pipe().subscribe((res) => {
            console.log(res);
            this.roles.splice(this.roles.indexOf(selected),1)
            this.editMode = '';
          })
        break;
      case 'cls':
        this.editMode = '';
        break;

      default:
        break;
    }
  }
  saveEdit(nameid:string){
    let title_val = (<HTMLInputElement>document.getElementById(nameid)).value
    let role:any = this.roles.find(i => i.nameid == nameid)
    role.title = title_val

    this.server.update('/admin/roles',role).pipe(
      take(1)
    ).subscribe((res) => {
      this.editMode = '';
    })
  }
}
