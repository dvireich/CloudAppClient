import { FolderContnentService } from "../../services/folder-content-service/folder-content-service";
import { IFolderContentDragAndDropView } from "./folder-content-drag-drop-view";
import { Injectable } from "@angular/core";
import { UploadArgs } from "../../upload-form.component/upload-args";

@Injectable({
    providedIn: "root"
})
export class FolderContentDragAndDropControler{

    private _view: IFolderContentDragAndDropView;
    constructor(private folderContentService: FolderContnentService){}

    public initializeView(view: IFolderContentDragAndDropView) {
        this._view = view;
    }

    public addFile(file : File, onError: (errorMessage) => void, onSuccess: ()=> void, currentPath: string) {
        let uploadArgs = new UploadArgs(file.name, file.type, file.size, file);
        this.folderContentService.createFile(
            uploadArgs.fileNameWithExtention,
            currentPath,
            uploadArgs.fileType,
            uploadArgs.fileSize,
            uploadArgs.file,
            onSuccess,
            onError);
    }
}