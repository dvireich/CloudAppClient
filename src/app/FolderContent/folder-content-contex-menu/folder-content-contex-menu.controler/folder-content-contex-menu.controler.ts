import { Injectable } from "@angular/core";
import { folderContentType } from "../../Model/folderContentType";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { IFolderContentContexMenuView } from "./ifolder-content-contex-menu-view";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { IFolderContent } from "../../Model/IFolderContent";
import { FolderContnentService } from "../../services/folder-content-service/folder-content-service";
import { FolderContentContainerControler } from "../../folder-content-container/folder-content-container-controler/folder-content-container-controler";
import { ClipBoardOperation } from "../../services/clipboard-service/clip-board-operation";
import { FolderContentClipBoard } from "../../services/clipboard-service/folder-content-clipboard";
import { Observable } from "rxjs";
import { IFolder } from "../../Model/IFolder";
import { IUploadArgs } from "../../upload-form.component/iupload-args";
import { sortType } from "../../Model/sortType";

@Injectable({
    providedIn: "root"
})
export class FolderContentContexMenuControler{

    private _view: IFolderContentContexMenuView;
    constructor(
        private folderContentService: FolderContnentService, 
        private clipboard: FolderContentClipBoard,
        private folderContentContainerControler: FolderContentContainerControler){
    }

    public initializeView(view: IFolderContentContexMenuView) {
        this._view = view;
    }
    
    public deleteFolderContent(selected: IFolderContent) {
        this._view.showMessage("Are you sure you want delete?", MessageBoxType.Question, MessageBoxButton.YesNo, "Delete", () => {
            if (this._view.messageBoxResult === DialogResult.No) return;
            this._view.showLoadingLayer(true);
            if (selected.Type === folderContentType.folder) {
                this.folderContentService.deleteFolder(selected.Name, selected.Path, this._view.currentPage).subscribe(
                    data => this.updateFolderContentWithCurrentPage(),
                    error => {
                        this._view.showLoadingLayer(false);
                        this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Delete", () => { })
                    }
                );
            }
            if (selected.Type === folderContentType.file) {
                this.folderContentService.deleteFile(selected.Name, selected.Path, this._view.currentPage).subscribe(
                    data => this.updateFolderContentWithCurrentPage(),
                    error => {
                        this._view.showLoadingLayer(false);
                        this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Delete", () => { })
                    }
                );
            }
        });
    }

    public copy(selected: IFolderContent) {
        this.clipboard.AddToClipBoard(selected, ClipBoardOperation.Copy);
    }

    public cut(selected: IFolderContent) {
        this.clipboard.AddToClipBoard(selected, ClipBoardOperation.Cut);
    }

    public downloadFile(selected: IFolderContent) {
        this._view.showLoadingLayer(true);
        this.folderContentService.downloadFile(selected.Name, selected.Path);
        this._view.showLoadingLayer(false);
    }

    public createFolder(folderName: string) {
        this._view.showLoadingLayer(true);
        let resp = this.folderContentService.createFolder(folderName, this._view.currentPath);
        resp.subscribe(
            data => this.updateFolderContentWithCurrentPage(),
            error => {
                this._view.showLoadingLayer(false);
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder", () => { });
            })
    }

    public rename(selected: IFolderContent, newName: string) {
        this._view.showLoadingLayer(true);
        let resp = this.folderContentService.renameFolderContent(selected.Name, selected.Path, selected.Type, newName);
        resp.subscribe(
            data => this.updateFolderContentWithCurrentPage(),
            error => {
                this._view.showLoadingLayer(false);
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Rename", () => { });
            })
    }

    public paste(copyTo: IFolderContent) {
        let letClipBoardOperation = this.clipboard.popClipBoardOperation();
        let objTocopy = this.clipboard.popClipBoardObj();

        if (copyTo === null || copyTo === undefined) {
            copyTo = this.getCurrentFolder();
        }

        if (this.folderContentService.createPath(copyTo.Name, copyTo.Path) === objTocopy.Path) return;

        let respOfCopy = this.folderContentService.copy(objTocopy, <IFolder>copyTo);
        this._view.showLoadingLayer(true);
        respOfCopy.subscribe(
            data => {
                if (letClipBoardOperation === ClipBoardOperation.Cut) {

                    let respOfDelete: Observable<object>;
                    if (objTocopy.Type == folderContentType.folder) {
                        respOfDelete = this.folderContentService.deleteFolder(objTocopy.Name, objTocopy.Path, this._view.currentPage);
                    }
                    if (objTocopy.Type == folderContentType.file) {
                        respOfDelete = this.folderContentService.deleteFile(objTocopy.Name, objTocopy.Path, this._view.currentPage);
                    }

                    respOfDelete.subscribe(data => this.updateFolderContentWithCurrentPage(),
                        error => {
                            this._view.showLoadingLayer(false);
                            this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: delete old folder", () => { });
                        });
                }
                else {
                    this.updateFolderContentWithCurrentPage();
                }

            },
            error => {
                this._view.showLoadingLayer(false);
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder", () => { });
            })
    }

    public addFile(uploadArgs: IUploadArgs, onError: (errorMessage) => void) {
        this.folderContentService.createFile(
            uploadArgs.fileNameWithExtention,
            this._view.currentPath,
            uploadArgs.fileType,
            uploadArgs.fileSize,
            uploadArgs.file,
            this.updateFolderContentWithCurrentPage.bind(this),
            onError);
    }

    updateFolderContentWithCurrentPage(){
        this.folderContentContainerControler.updateFolderContentWithCurrentPage();
    }

    public canPaste(selected: IFolderContent) {

        let clipboardObj = this.clipboard.peekClipBoardObj();
        return this.clipboard.popClipBoardOperation() !== null &&
            this.clipboard.popClipBoardOperation() !== undefined &&
            clipboardObj !== null &&
            clipboardObj !== undefined &&
            //Or we have selected or we do not have and we paste in the containing folder
            ((selected !== null &&
                selected !== undefined &&
                !clipboardObj.equals(selected))
                ||
                (selected === null ||
                    selected === undefined));
    }

    public updateCurrentFolderMetadata(sortType: sortType, numOfElementOnPage: number) {
        this._view.showLoadingLayer(true);
        let currentFolder = this.getCurrentFolder();
        this.folderContentService.updateFolderMetadata(currentFolder.Name, currentFolder.Path, sortType, numOfElementOnPage).subscribe(
            success => {
                this.updateFolderContentWithCurrentPage();
            },
            error => {
                this._view.showLoadingLayer(false);
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in update", () => { })
            });
    }

    public enterFolder(name: string, path: string, pageNum: number){
        this.folderContentContainerControler.updateFolderContent(name, path, pageNum);
    }

    getCurrentFolder(){
        return this.folderContentContainerControler.getCurrentFolder();
    }
}