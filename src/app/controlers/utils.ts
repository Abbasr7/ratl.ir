import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, Renderer2, RendererFactory2 } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import * as $ from 'jquery';

@Injectable({
    providedIn: 'root'
})
export class customValidate {

    phonePattern: string = '09(0[1-2]|1[0-9]|3[0-9]|2[0-1])-?[0-9]{3}-?[0-9]{4}';

    checkMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
        return (group: FormGroup) => {
            let passwordInput = group.controls[passwordKey],
                passwordConfirmationInput = group.controls[passwordConfirmationKey];
            if (passwordInput.value !== passwordConfirmationInput.value) {
                return passwordConfirmationInput.setErrors({ notEquivalent: true })
            }
            else {
                return passwordConfirmationInput.setErrors(null);
            }
        }
    }

    checkFormArrayValue(...args: string[]) {
        return (controls: AbstractControl) => {
            args.forEach(arg => {
                if (controls.get(arg)!.value.length == 0 || controls.get(arg)!.value[0].title == '') {
                    return controls.get(arg)!.setErrors({ required: true })
                } else {
                    return controls.get(arg)!.setErrors(null)
                }
            });
        }
    }

    isEmail(email: string) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    isValidMessages(getFormControls: any) {
        let msg: any = {}
        for (const x in getFormControls) {
            msg[x] = this.setValidationMsg(getFormControls[x].errors)
        }
        return msg
    }

    private setValidationMsg(error: any) {
        let msg = []
        if (error != null) {
            if (Object.prototype.hasOwnProperty.call(error, 'required')) {
                msg.push('نمیتواند خالی باشد.')
            }
            if (error.email) {
                msg.push('فرمت ایمیل صحیح نیست!')
            }
            if (error.minlength != null) {
                msg.push(`اندازه حداقل باید ${error.minlength.requiredLength} باشد.`)
            }
            if (error.pattern) {
                if (error.pattern.requiredPattern == "^[a-zA-Z0-9_ ]*$") {
                    msg.push('فقط حروف انگلیسی مجاز میباشد.')
                } else {
                    msg.push('فرمت وارد شده صحیح نیست.')
                }
            }
            if (error.notEquivalent) {
                msg.push('رمز وارد شده و تکرار آن با هم مطابقت ندارد.')
            }
        }

        return msg
    }
}


@Injectable({
    providedIn: 'root'
})
export class Spinner {
    constructor(@Inject(DOCUMENT) private document: any, private rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null)
    }
    public renderer: Renderer2
    private spinner = `
        <svg role="status" class="inline mr-2 w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>`
    private spinDiv: Node

    addSpinner(target: string) {
        if (this.isAdded()) {
            this.removeSpinner(target)
        }
        if (!this.isAdded()) {
            this.addElementTo(target, this.spinner)
        }
    }

    addSuccessIcon(target: string) {
        let icon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 fill-green-600" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>`
        let added = false

        if (this.isAdded()) {
            this.removeSpinner(target)
        }
        if (!this.isAdded()) {
            this.addElementTo(target, icon)
            added = true
        }
        if (added) {
            setTimeout(() => {
                this.removeSpinner(target)
            }, 4000)
        }

    }

    removeSpinner(target: string, callback: any = () => { }) {
        $('.spinner-qk').remove()
        callback()
    }

    private addElementTo(target: string, element: string) {
        this.spinDiv = this.document.createElement('div')//this.renderer.createElement('div')
        this.renderer.addClass(this.spinDiv, 'spinner-qk')
        this.renderer.setProperty(this.spinDiv, 'innerHTML', element)
        let tar = this.renderer.selectRootElement(target, true)
        this.renderer.appendChild(tar, this.spinDiv)

        $(target).fadeIn(500);

    }
    private isAdded() {
        let tar = this.document.getElementsByClassName('spinner-qk')
        if (!tar.length) {
            return false
        }
        return true
    }
}
