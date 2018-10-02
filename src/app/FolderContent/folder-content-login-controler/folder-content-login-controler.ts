
import { Injectable } from "@angular/core";
import { IFolderContentLoginView } from "./ifolder-content-login-view";
import { Router } from "@angular/router";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { catchError } from "rxjs/operators";
import { Observable, of  } from "rxjs";
import { AuthenticationService } from "../authentication-service/authentication-service";
import { FolderContnentService } from "../Folder-content-service/folder-content-service";

@Injectable({
    providedIn: "root"
})
export class FolderContentLoginContoler {
    _view: IFolderContentLoginView;

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private folderContentService: FolderContnentService
    ) { }

    initializeView(view: IFolderContentLoginView) {
        this._view = view;
    }

    registerUser(userName: string, password: string) {
        if(!this.validateEmptyUserNameAndPassword(userName, password)) return;
        this._view.isLoading = true;
        this.authenticationService.registerUser(userName, password, this.onError.bind(this)).subscribe(
            registered => {
            this._view.isLoading = false;
            this._view.userNameMessage = "";
            this._view.passwordMessage = "";
            this._view.showMessage("Successfully Registered", MessageBoxType.Information, MessageBoxButton.Ok, "Register", () => { });    
            }
                ,
            error => {
                this._view.isLoading = false;
                this._view.userNameMessage = "";
                this._view.passwordMessage = "";
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Register", () => { });
            }
        )
    }

    login(userName: string, password: string) {
        if(!this.validateEmptyUserNameAndPassword(userName, password)) return;
        this._view.isLoading = true;
        this.authenticationService.login(userName, password,this.onError.bind(this)).subscribe(
            response => {
                this.folderContentService.initializeFolderContentUrl(response);
                this.waitForServiceToInitialize();
            },
            error => {
                this._view.userNameMessage = "";
                this._view.passwordMessage = "";
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

    private validateEmptyUserNameAndPassword(userName: string, password: string) : boolean{
        let valid = true;
        if(userName === null || userName ===undefined || userName.length === 0){
            this._view.userNameMessage = "User name connot be empty"
            valid = false;
        }
        else{
            this._view.userNameMessage = "";
        }
        if(password === null || password ===undefined || password.length === 0){
            this._view.passwordMessage = "password connot be empty"
            valid = false;
        }
        else{
            this._view.passwordMessage = "";
        }

        return valid;
    }

    private isMobileDevice() : boolean {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor);
        return check;
    }

    blockMobileDevice(){
        if(!this.isMobileDevice()) return;
        this._view.showMessage("Mobile devices are not supported yet. Sorry", MessageBoxType.Information, MessageBoxButton.None, "Not Supported", ()=> {});
    }
}