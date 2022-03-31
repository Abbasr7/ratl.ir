import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  public renderer: Renderer2 // نکته برای استفاده از renderer در کامپوننت 

  constructor(@Inject(DOCUMENT) private document: any, private rendererFactory:RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null,null)
   }
  sendMessage(msg: string, flag: string, time: number = 3000) {
    let bg = 'bg-' + flag;
    let progress = 0, progressWidth = 0;

    let toastBlock: any
    let context = this.createToast(msg,flag);
    let progressDiv = this.renderer.createElement('div')
    this.renderer.addClass(progressDiv, 'progressdiv')
    let toastDiv = this.renderer.createElement('div');
    this.renderer.addClass(toastDiv, bg)
    this.renderer.addClass(toastDiv, 'toast-block')
    this.renderer.setProperty(toastDiv, 'innerHTML', context)
    this.renderer.appendChild(toastDiv, progressDiv)

    if (this.document.getElementsByClassName('toast-container').length) {
      toastBlock = this.renderer.selectRootElement('.toast-container', true)
      this.renderer.appendChild(toastBlock, toastDiv)
    } else {
      toastBlock = this.renderer.createElement('div')
      this.renderer.addClass(toastBlock, 'toast-container')
      this.renderer.appendChild(toastBlock, toastDiv)
      this.renderer.appendChild(this.document.body, toastBlock)
    }

    let interval = setInterval(() => {
      progress += 10
      progressWidth = progress * 100 / time
      let pbar = `<div class="bg-blue-600 h-1" style="width: ${progressWidth}%"></div>`
      this.renderer.setProperty(progressDiv, 'innerHTML', pbar)
    }, 10)

    setTimeout(() => {
      this.renderer.removeChild(toastBlock, toastDiv)
      clearInterval(interval)
    }, time)
  }

  private createToast(msg: string,flag:string) {
    let svg;
    switch (flag) {
      case 'success':
        svg = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`
        break;
      case 'info':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>`
        break
      case 'warning':
        svg = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`
        break
      case 'danger':
        svg = `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`
        break
      default:
        break;
    }
    let context = `
    <div class="toast p-4">
      <button type="button" class="toast-btn" data-collapse-toggle="toast-success" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
      </button>
      <div class="ml-3 text-sm font-normal">${msg}</div>
      <div class="toast-icon text-${flag}">
        ${svg}
      </div>
    </div>
      `;
    return context
  }
}
