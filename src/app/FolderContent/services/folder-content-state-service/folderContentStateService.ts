import { Injectable } from "@angular/core";
import { IFolderState } from "./ifolder-state";
import { FolderState } from "./folder-state";
import { IUploadContainerState } from "./iupload-container-state";
import { IFolder } from "../../Model/IFolder";

@Injectable({
    providedIn: "root"
})
export class FolderContentStateService {
    private currentFolder: IFolder;
    private currentPage: number;

    private uploadContainerState: IUploadContainerState;

    setCurrentFolderState(currentFolder: IFolder, currentPage: number) {
        this.currentFolder = currentFolder;
        this.currentPage = currentPage;
    }

    restoreFolderState(): IFolderState {
        if (this.currentFolder === null || this.currentFolder === undefined) {
            return new FolderState("home", "", 1);
        }
        return new FolderState(this.currentFolder.Name, this.currentFolder.RelativePath, this.currentPage);
    }

    setUploadContainerState(uploadContainerState: IUploadContainerState) {
        this.uploadContainerState = uploadContainerState;
    }

    restoreUploadContainerState(): IUploadContainerState {
        return this.uploadContainerState;
    }
}
