import { Component, OnInit } from "@angular/core";
import { FolderContentLoginContoler } from "../folder-content-login-controler/folder-content-login-controler";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { IFolderContentLoginView } from "../folder-content-login-controler/ifolder-content-login-view";
import { LoginTabs } from "./login-mode";

@Component({
    selector: 'login',
    templateUrl: 'folder-content-login.component.html',
    styleUrls: ['folder-content-login.component.css']
})
export class FolderContentLogin implements IFolderContentLoginView, OnInit {

    constructor(private controler: FolderContentLoginContoler) {
        controler.initializeView(this);
        this.controler.applyRememberMeAction();
    }

    loginTabStyles: string[];
    registerTabStyles: string[];
    showRegisterForm: boolean = false;
    showLoginForm: boolean = true;

    private _loginTab: LoginTabs;
    public get loginTab(): LoginTabs {
        return this._loginTab;
    }
    public set loginTab(value: LoginTabs) {
        this._loginTab = value;
        this.loginTabStyles = this.getLoginTabStyleClasses();
        this.registerTabStyles = this.getRegisterTabStyleClasses();
        this.showRegisterForm = value === LoginTabs.register;
        this.showLoginForm = value === LoginTabs.login;
    }

    usernameInputText: string;
    passwordInputText: string;

    registerUserNameInputText: string;
    registerPasswordInputText: string;
    registerRecoveryQuestionInputText: string;
    registerRecoveryAnswerInputText: string;

    private _isLoading: boolean;
    public set isLoading(value: boolean) {
        this._isLoading = value;
    }
    public get isLoading(): boolean {
        return this._isLoading;
    }
    private _registerUserNameMessage: string;
    public get registerUserNameMessage(): string {
        return this._registerUserNameMessage;
    }
    public set registerUserNameMessage(value: string) {
        this._registerUserNameMessage = value;
    }
    private _registerPasswordMessage: string;
    public get registerPasswordMessage(): string {
        return this._registerPasswordMessage;
    }
    public set registerPasswordMessage(value: string) {
        this._registerPasswordMessage = value;
    }
    private _registerRecoveryQuestionMessage: string;
    public get registerRecoveryQuestionMessage(): string {
        return this._registerRecoveryQuestionMessage;
    }
    public set registerRecoveryQuestionMessage(value: string) {
        this._registerRecoveryQuestionMessage = value;
    }

    private _registerRecoveryAnswerMessage: string;
    public get registerRecoveryAnswerMessage(): string {
        return this._registerRecoveryAnswerMessage;
    }
    public set registerRecoveryAnswerMessage(value: string) {
        this._registerRecoveryAnswerMessage = value;
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

    private _rememberMe: boolean = true;
    public get rememberMe(): boolean {
        return this._rememberMe;
    }
    public set rememberMe(value: boolean) {
        this._rememberMe = value;
    }
    private _needToShowComponent: boolean = false;
    public get needToShowComponent(): boolean {
        return this._needToShowComponent;
    }
    public set needToShowComponent(value: boolean) {
        this._needToShowComponent = value;
    }


    needToShowMessageBox: boolean;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    ngOnInit(): void {
        this.loginTab = LoginTabs.login;
    }
    
    onLoginClick(username: string, password: string) {
        this.controler.login(username, password);
    }

    onRegisterClick(username: string, password: string, recoveryQuestion: string, recoveryAnswer: string) {
        this.controler.registerUser(username, password, recoveryQuestion, recoveryAnswer);
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

    checkBoxChanged(current: boolean){
        this.rememberMe = current;
    }

    getLoginTabStyleClasses(){
        if(this.loginTab == LoginTabs.login) return ['active'];
        return ['notActive'];
    }

    getRegisterTabStyleClasses(){
        if(this.loginTab == LoginTabs.register)  return ['active'];
        return ['notActive'];
    }

    changeToLoginForm(){
        this.loginTab = LoginTabs.login;
    }

    changeToRegisterForm(){
        this.loginTab = LoginTabs.register;
    }


}