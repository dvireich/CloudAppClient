import { Component } from "@angular/core";
import { FolderContentLoginContoler } from "../folder-content-login-controler/folder-content-login-controler";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { IFolderContentLoginView } from "../folder-content-login-controler/ifolder-content-login-view";

@Component({
    selector: 'login',
    templateUrl: 'folder-content-login.component.html',
    styleUrls: ['folder-content-login.component.css']
})
export class FolderContentLogin implements IFolderContentLoginView{
    constructor(private controler: FolderContentLoginContoler){
        controler.initializeView(this);
    }


    private usernameInputText: string;
    private passwordInputText: string;

    private _isLoading: boolean;
    public set isLoading(value: boolean) {
        this._isLoading = value;
    }
    private _userNameMessage: string;
    public set userNameMessage(value: string) {
        this._userNameMessage = value;
    }

    private _passwordMessage: string;
    public set passwordMessage(value: string) {
        this._passwordMessage = value;
    }
    private _messageBoxText: string;

    public get messageBoxText(): string {
        return this._messageBoxText;
    }

    public set messageBoxText(value: string) {
        this._messageBoxText = value;
    }
    private _messageBoxResult: DialogResult;

    public get messageBoxResult(): DialogResult {
        return this._messageBoxResult;
    }

    public set messageBoxResult(value: DialogResult) {
        this._messageBoxResult = value;
    }
    needToShowMessageBox: boolean;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    onLoginClick(username: string, password: string){
        this.controler.login(username, password);
    }

    onRegisterClick(username: string, password: string){
        this.controler.registerUser(username, password);
    }

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
}