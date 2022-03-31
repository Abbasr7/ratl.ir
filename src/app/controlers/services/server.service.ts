import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Globals } from 'src/app/globals';

const Url = Globals.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http:HttpClient) { }

  get(suburi:string){
    return this.http.get(Url+suburi)
  }

  create(suburi:string, data:{}|string){
    return this.http.post(Url+suburi, data)
  }

  update(suburi:String,data:{}|string){
    return this.http.put(Url+suburi,data)
  }

  delete(suburi:string){
    return this.http.delete(Url+suburi)
  }
}
