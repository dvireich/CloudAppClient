import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { IForgotPasswordView } from "../forgot-password-controler/iforgot-password-view";
import { ForgotPasswordControler } from "../forgot-password-controler/forgot-password-controler";
import { DialogResult } from "../../../../../Common/messagebox.component/messageboxResult";
import { MessageBoxButton } from "../../../../../Common/messagebox.component/messageBoxButtons";
import { MessageBoxType } from "../../../../../Common/messagebox.component/messageBoxType";

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['forgot-password.component.css']
})
export class ForgotPassword implements IForgotPasswordView, OnInit {
   
    constructor(private forgotPasswordControler: ForgotPasswordControler) {
        forgotPasswordControler.initializeView(this);
    }

    @Input() userName: string;
    @Output() cancel : EventEmitter<void> = new EventEmitter<void>();

    password: string;
    securityQuestion: string;
    securityAnswer: string;
    isLoading: boolean;
    messageBoxText: string;
    messageBoxResult: DialogResult;
    needToShowMessageBox: boolean;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    onMessageBoxClick(action: (result: DialogResult) => void, cont: () => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (result: DialogResult) => {
            bindedAction(result);
            bindedCont();
        }
    }

    onMessageBoxCancel(result: DialogResult) {
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    onMessageBoxOk(result: DialogResult) {
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    showMessageBox(message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont: () => void = () => { }) {
        this.messageBoxOnButton1Click = this.onMessageBoxClick(this.onMessageBoxOk, cont).bind(this);
        this.messageBoxOnButton2Click = this.onMessageBoxClick(this.onMessageBoxCancel, cont).bind(this);
        this.messageBoxMessageType = type;
        this.messageBoxText = message;
        this.messageBoxButtons = buttons;
        this, this.messageBoxCaption = caption;
        this.needToShowMessageBox = true;
    }

    showMessage(
        message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void) {
        this.showMessageBox(message, type, buttons, caption, cont);
    }

    onRestore(){
        this.forgotPasswordControler.restorePassword(this.userName, this.securityAnswer);
    }

    onCancel(){
        this.cancel.emit();
    }

    ngOnInit(): void {
        this.forgotPasswordControler.getSecurityQuestion(this.userName);
    }

    close(){
        this.onCancel();
    }
}