import { Injectable } from "@angular/core";
import { IForgotPasswordView } from "./iforgot-password-view";
import { AuthenticationService } from "../../../../authentication-service/authentication-service";
import { MessageBoxType } from "../../../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../../../Common/messagebox.component/messageBoxButtons";

@Injectable({
    providedIn: "root"
})
export class ForgotPasswordControler{

    private _view: IForgotPasswordView
    
    constructor(private authenticationService: AuthenticationService){}

    public initializeView(view: IForgotPasswordView) {
        this._view = view;
    }

    public getSecurityQuestion(userName: string){
        this._view.isLoading = true;
        this.authenticationService.getSecurityQuestion(userName).subscribe(
            securityQusetion => {
                this._view.isLoading = false;
                this._view.securityQuestion = securityQusetion;
            },
            error =>{
                this._view.isLoading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Get security question", ()=>{
                    this._view.close();
                }); 
            }
        )
    }

    public restorePassword(userName: string, securityAnswer: string){
        this._view.isLoading = true;
        this.authenticationService.restorePassword(userName, securityAnswer).subscribe(
            password => {
                this._view.isLoading = false;
                this._view.password = password;
            },
            error => {
                this._view.isLoading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Restore password", ()=>{
                    this._view.close();
                });
            }
        )
    }
}