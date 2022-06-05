import { Injectable } from '@angular/core';
import { Globals } from 'src/app/globals';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class ProjactsService {

  constructor(private server:ServerService) { }

  projactsApi = Globals.projactsApi

  newProjact(data:{}){
    return this.server.create(this.projactsApi.create,data)
  }

  update(data:{}){
    return this.server.update(this.projactsApi.edit,data)
  }

  getById(id:String){
    return this.server.get(this.projactsApi.details+id)
  }

  getAllUserProjacts(){
    return this.server.get(this.projactsApi.getAll)
  }
}
