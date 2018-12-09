import { FolderContnentService } from "../../services/folder-content-service/folder-content-service";
import { IFolderContentDragAndDropView } from "./folder-content-drag-drop-view";
import { Injectable } from "@angular/core";
import { FolderContentContainerControler } from "../../folder-content-container/folder-content-container-controler/folder-content-container-controler";
import { UploadArgs } from "../../upload-form.component/upload-args";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";

@Injectable({
    providedIn: "root"
})
export class FolderContentDragAndDropControler{

    private _view: IFolderContentDragAndDropView;
    constructor(private folderContentContainerControler: FolderContentContainerControler){}

    public initializeView(view: IFolderContentDragAndDropView) {
        this._view = view;
    }

    addFile(file : File, onError: (message: string) => void){
        let uploadArgs = new UploadArgs(file.name, file.type, file.size, file);
        this.folderContentContainerControler.addFile(uploadArgs, onError.bind(this));
    }
}