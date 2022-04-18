import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  loading = false

  ngOnInit(): void {
    this.getListsAndItems()
    this.toNestable()
  }

  getListsAndItems() {
    this.server.get('/admin/menus').pipe(
      map(i => i as SuccessHandle),
    ).subscribe(res => {
      res.data.lists.map((x: any) => x.order ? x.order = JSON.parse(x.order) : '')
      this.list = res.data.lists
    })
  }

  toNestable() {
    // برای کارکردن اسکریپت nestable
    let dd_empty = document.querySelector('.dd-empty');
    let nestable = document.createElement("script");
    let exist = document.querySelector('#myScript')
    if (exist != null) {
      document.body.removeChild(exist)
      nestable.setAttribute("id", "myScript");
      nestable.setAttribute("src", "assets/js/nestable.js");
      document.body.appendChild(nestable);
    } else {
      nestable.setAttribute("id", "myScript");
      nestable.setAttribute("src", "assets/js/nestable.js");
      document.body.appendChild(nestable);
    }
    dd_empty? document.body.removeChild(dd_empty):''

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
      // type: 'item',
      // listId: parentList.value,
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
    let item_setting = $(item).closest(".dd-item").find(".item-settings").first();

    if (item_setting.hasClass("d-none")) {
      item_setting.removeClass("d-none");
    } else {
      item_setting.addClass("d-none");
    }
  }

  deleteItem(elm: HTMLElement,type:string,id:string = '',index:number = 0) {
    this.loading = true
    if (type=='item') {
      $(elm).closest(".dd-item").first().remove();
      document.dispatchEvent(event)
    } else {
      console.log(id);
      
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
    this.spinner.addSpinner('.saveOrder');
    let data = {
      type: 'order',
      listId: listId,
      order: order.value
    }

    lastValueFrom(this.server.create('/admin/menus', data)).then((res: any) => {
      this.spinner.removeSpinner('.saveOrder')
      this.msg.sendMessage('با موفقیت ذخیره شد', 'success')
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
