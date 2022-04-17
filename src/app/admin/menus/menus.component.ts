import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/controlers/services/server.service';
import * as $ from 'jquery'
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs';
import { SuccessHandle } from 'src/app/controlers/interfaces/interfaces';
import { MessagesService } from 'src/app/controlers/services/messages.service';
import { Spinner } from 'src/app/controlers/utils';
const event = new Event('updateOutput');// برای اپدیت کردن ترتیب آیتم های فهرست

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {

  constructor(private server: ServerService,
    private msg: MessagesService,
    private spinner: Spinner) { }

  list: any[] = []
  items: any[] = []

  ngOnInit(): void {
    this.getListsAndItems()
    this.toNestable()
  }

  getListsAndItems() {
    this.server.get('/admin/menus').pipe(
      map(i => i as SuccessHandle),
      ).subscribe(res => {
      res.data.lists.map((x:any) => x.order?x.order = JSON.parse(x.order):'')
      this.list = res.data.lists
      this.items = res.data.items

      console.log(res,this.list);
    })
  }

  toNestable() {
    // برای کارکردن اسکریپت nestable
    var nestable = document.createElement("script");
    nestable.setAttribute("id", "myScript");
    nestable.setAttribute("src", "assets/js/nestable.js");
    document.body.appendChild(nestable);
  }

  getCurrentListTitle(id: string) {
    let currentList = this.list.find(i => i._id == id)
    return currentList.title
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

  async addItem(title: HTMLInputElement, url: HTMLInputElement, parentList: HTMLSelectElement) {
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
      type: 'item',
      listId: parentList.value,
      dataId: dataId,
      title: title.value,
      url: url.value
    }

    let saved: any = await lastValueFrom(this.server.create('/admin/menus', data))

    let index = this.items.findIndex((i: any) => i[0].listId == parentList.value)
    if (!this.items.length || index == -1) {
      this.items.push([saved.data])
    } else {
      this.items[index].push(saved.data)
    }

    title.value = ''
    url.value = ''

    document.dispatchEvent(event)
  }

  openEditSection(item: HTMLElement) {
    let item_setting = $(item).closest(".dd-item").find(".item-settings").first();

    if (item_setting.hasClass("d-none")) {
      item_setting.removeClass("d-none");
    } else {
      item_setting.addClass("d-none");
    }
  }

  deleteItem(elm: HTMLElement, type: string, x: number, y: number) {
    let dataId = $(elm).closest(".dd-item").data('id')

    lastValueFrom(this.server.delete('/admin/menus?type=' + type + '&id=' + dataId)).then(() => {
      $(elm).closest(".dd-item").remove();
      document.dispatchEvent(event)
    })
  }

  saveMenuOrder(listId: string, order: HTMLTextAreaElement) {
    this.spinner.addSpinner('.saveOrder');
    let data = {
      type: 'order',
      listId: listId,
      order: order.value
    }
    console.log(order.value);

    lastValueFrom(this.server.create('/admin/menus', data)).then((res: any) => {
      this.spinner.removeSpinner('.saveOrder')
      console.log(res);

    })

  }

  getListIds() {
    let ids: any = [];
    this.list.forEach(i => {
      ids.push(i._id)
    })
    return ids
  }

}
