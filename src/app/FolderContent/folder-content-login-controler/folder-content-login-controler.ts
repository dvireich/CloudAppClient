
import { Injectable } from "@angular/core";
import { IFolderContentLoginView } from "./ifolder-content-login-view";
import { FolderContnentService } from "../Folder-content-service/folder-content-service";
import { Router } from "@angular/router";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { catchError } from "rxjs/operators";
import { Observable, of  } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class FolderContentLoginContoler {
    _view: IFolderContentLoginView;

    constructor(
        private folderContentService: FolderContnentService,
        private router: Router
    ) { }

    initializeView(view: IFolderContentLoginView) {
        this._view = view;
    }

    registerUser(userName: string, password: string) {
        this._view.isLoading = true;
        this.folderContentService.registerUser(userName, password, this.onError.bind(this)).subscribe(
            registered => {
            this._view.isLoading = false;
            this._view.showMessage("Successfully Registered", MessageBoxType.Information, MessageBoxButton.Ok, "Error: Register", () => { });    
            }
                ,
            error => {
                this._view.isLoading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Register", () => { });
            }
        )
    }

    login(userName: string, password: string) {
        this._view.isLoading = true;
        this.folderContentService.login(userName, password,this.onError.bind(this)).subscribe(
            response => {
                this.folderContentService.initializeFolderContentUrl(response);
                this.waitForServiceToInitialize();
            },
            error => {
                this._view.isLoading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Login", () => { });
            }
        )
    }

    waitForServiceToInitialize() {
        this.folderContentService.pingToServer().pipe(catchError(this.ignoreError)).subscribe(
            response => {
                if (response) {
                    this._view.isLoading = false;
                    this.router.navigate(['/workspace']);
                }
            },
            error => this.waitForServiceToInitialize());
    }

    private ignoreError(){
        this.waitForServiceToInitialize();
        return of(false);
    }

    private onError(error: string){
        this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Login", () => { })
    }
}