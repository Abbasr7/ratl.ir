import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { ISettings, SuccessHandle } from '../interfaces/interfaces';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(private server:ServerService) {
    this.setSettings()
  }

  settings = new BehaviorSubject(new ISettings)

  async getSettings(){
    let res = await lastValueFrom(this.server.get('/api/settings').pipe(
      map(i => i as SuccessHandle),
      map(i => i.data as ISettings)
    ))

    return res;
  }
  
  async setSettings(){
    let res = await this.getSettings()
    this.settings.next(res as ISettings)
  }

  updateSettings(data:{}){
    return this.server.update('/admin/settings', data).pipe(
      map(res => res as SuccessHandle)
    )
  }
}
