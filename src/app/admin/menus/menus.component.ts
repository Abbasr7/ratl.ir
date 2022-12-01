import { Component, Inject, OnInit, Renderer2} from '@angular/core';
import { ServerService } from 'src/app/controlers/services/server.service';
import * as $ from 'jquery'
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { Spinner } from 'src/app/controlers/utils';
import { SettingsService } from 'src/app/controlers/services/settings.service';
import { Globals } from 'src/app/globals';
import { DOCUMENT } from '@angular/common';
const event = new Event('updateOutput');// برای اپدیت کردن ترتیب آیتم های فهرست

const SCRIPT_PATH = 'https://apis.google.com/js/api.js';
declare let gapi: any;

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {

  constructor(private server: ServerService,
    private msg: MessagesService,
    private spinner: Spinner,
    private settingsService: SettingsService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2) {
    }

  list: any[] = [];
  settings:any
  loading = false
  menusApi = Globals.publicApi.getMenus

  ngOnInit(): void {
    this.getListsAndItems();
  }

  getListsAndItems() {
    this.server.get(this.menusApi).pipe(
      map(i => i as SuccessHandle),
    ).subscribe(res => {
      res.data.map((x: any) => x.order ? x.order = JSON.parse(x.order) : '')
      this.list = res.data;
      this.toNestable().onload = () => {
        console.log('nastable loaded');
      }
    })
  }

  toNestable() {
    // برای کارکردن اسکریپت nestable
    let dd_empty = document.querySelector('.dd-empty');
    let nestable = this.renderer.createElement("script");
    let exist = document.querySelector('#myScript')

    if (exist != null) {
      document.body.removeChild(exist)
    }
    // else {
    //   nestable.setAttribute("id", "myScript");
    //   nestable.setAttribute('defer','');
    //   nestable.setAttribute("src", "assets/js/nestable.js");
    //   document.body.appendChild(nestable);
    // }
    nestable.id = "myScript";
    nestable.src = "assets/js/nestable.js";
    nestable.defer = '';
    this.renderer.appendChild(this.document.body,nestable);
    dd_empty? document.body.removeChild(dd_empty):''
    return nestable;
  }

  getCurrentListSelected(loc: string,id:string) {
    let settings:any = this.settingsService.settings.value;

    return settings[loc] == id
  }

  addList(listName: HTMLInputElement) {
    if (!listName.value) {
      $(listName).addClass('ring-2 ring-red-500')
      return
    }
    let data = { type: 'list', title: listName.value }
    let item = `
        <div class="shadow p-3 w-full flex justify-between items-center">
          <div>${listName.value}</div>
          <div class="flex gap-2">
          <span class="text-blue-600">ویرایش</span>
          <span class="text-red-600">حذف</span>
          </div>
          </div>`

    lastValueFrom(this.server.create('/admin/menus', data).pipe(
      map(i => i as SuccessHandle)
    )).then(res => {
      this.list.push(res.data)
      $('#lists').append(item)
      listName.value = ''
    })
  }

  editList(id:string,title:string){
    this.loading = true
    let data = {
      type: 'editlist',
      listId: id,
      title: title
    }
    
    lastValueFrom(this.server.create('/admin/menus', data)).then(res => {
      this.loading = false
    })
  }
  menuLocation(el:HTMLSelectElement,flag:string){
    let data:any = {};
    data[flag] = el.value
    this.loading = true
    
    lastValueFrom(this.server.update('/admin/settings/menu/'+flag ,data)).then((res:any) =>{
      this.loading = false
      this.spinner.addSuccessIcon('#spinner')
    }).catch(()=>{
      this.loading = false
    })
  }

  async addItem(title: HTMLInputElement, url: HTMLInputElement, parentListId: HTMLSelectElement) {
    // Form validate
    if (!title.value || !url.value) {
      $(title).addClass('ring-2 ring-red-500');
      $(url).addClass('ring-2 ring-red-500');
      return
    } else if (!this.list.length) {
      this.msg.sendMessage('ابتدا باید یک فهرست ایجاد کنید.', 'warning')
      return
    }
    let dataId = Date.now()
    let data = {
      id: dataId,
      content: title.value,
      url: url.value
    }
    let selectedList = this.list.find(l => l._id == parentListId.value)

    selectedList.order?selectedList.order.push(data) : selectedList.order = [data]
    $('#nestable-output-'+parentListId.value).val(JSON.stringify(selectedList.order))

    title.value = ''
    url.value = ''

  }

  openEditSection(item: HTMLElement) {
    let item_setting = $(item).closest(".listitem").find(".item-settings").first();

    if (item_setting.hasClass("d-none")) {
      item_setting.removeClass("d-none");
    } else {
      item_setting.addClass("d-none");
    }
  }

  deleteItem(elm: HTMLElement,type:string,id:string = '',index:number = 0) {
    this.loading = true
    if (type=='item') {
      this.loading = false
      $(elm).closest(".dd-item").first().remove();
      document.dispatchEvent(event)
    } else {
      lastValueFrom(this.server.delete('/admin/menus?id='+id)).then((res:any) => {
        if (res.data == 1) {
          this.loading = false
          this.list.splice(index,1);
          $(elm).closest("#listItem").first().remove();
        }
      })
    }
  }

  saveMenuOrder(listId: string, order: HTMLTextAreaElement) {
    this.loading = true
    this.spinner.addSpinner('.saveOrder');
    let data = {
      type: 'order',
      listId: listId,
      order: order.value
    }
    
    lastValueFrom(this.server.create('/admin/menus', data)).then((res: any) => {
      this.spinner.removeSpinner('.saveOrder')
      this.msg.sendMessage('با موفقیت ذخیره شد', 'success')
      this.loading = false
    })

  }

  changemMenuItem(input: HTMLInputElement, type: string) {
    if (type == 'title') {
      $(input).closest(".dd-item").data("content", input.value);
      $(input).closest(".dd-item").find(".dd3-content span").first().text(input.value);
    } else {
      $(input).closest(".dd-item").first().data("url", input.value);
    }
    document.dispatchEvent(event)

  }
  getListIds() {
    let ids: any = [];
    this.list.forEach(i => {
      ids.push(i._id)
    })
    return ids
  }

  arrayToString(obj: any) {
    return JSON.stringify(obj)
  }
}
