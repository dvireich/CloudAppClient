import { IFolderContentContainerView } from "./ifolder-content-container-view";
import { Injectable } from "@angular/core";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { IFolderContent } from "../Model/IFolderContent";
import { folderContentType } from "../Model/folderContentType";
import { FolderContentClipBoard } from "../clipboard-service/folder-content-clipboard";
import { ClipBoardOperation } from "../clipboard-service/clip-board-operation";
import { IFolder } from "../Model/IFolder";
import { Observable } from "rxjs";
import { FolderObj } from "../Model/FolderObj";
import { IUploadArgs } from "../upload-form.component/iupload-args";
import { FolderContentStateService } from "../folder-content-state-service/folder-content-state-service";
import { sortType } from "../Model/sortType";
import { catchError } from "rxjs/operators";
import { FolderContnentService } from "../services/Folder-content-service/folder-content-service";

@Injectable({
    providedIn: "root"
})
export class FolderContentContainerControler {

    private _view: IFolderContentContainerView;
    constructor(
        private folderContentService: FolderContnentService,
        private clipboard: FolderContentClipBoard,
        private folderContentStateService: FolderContentStateService) {

        folderContentService.subscriberToFinishUploadToAction(this, this.updateFolderContentWithCurrentPage.bind(this));
    }
    //Public methods:

    public initializeView(view: IFolderContentContainerView) {
        this._view = view;
    }

    public logout() {
        this.folderContentService.logout();
    }

    public updateFolderContent(folderName: string, folderPath: string, pageNum: number): void {
        this._view.loading = true;
        let cancelLoading = ()=> {this._view.loading = false;};
        this.UpdateSortForFolder(folderName, folderPath, pageNum,
            () => {
                this.updateFolder(folderName, folderPath, pageNum, this._view.currentSortType,
                    () => {
                        this.UpdateNumberOfElementsOnPage(folderName, folderPath, pageNum, cancelLoading, cancelLoading)
                        this._view.updateRefreshButtonState();
                    },
                    cancelLoading)
            },
            cancelLoading)
    }

    private UpdateSortForFolder(folderName: string, folderPath: string, pageNum: number, onSuccess: () => void, onError: () => void): void {
        this.folderContentService.GetSortForFolder(folderName, folderPath).subscribe(
            sortType => {
                this._view.currentSortType = sortType;
                if (onSuccess !== null && onSuccess != undefined) {
                    onSuccess();
                }
            },
            error => {
                if (onError !== null && onError != undefined) {
                    onError();
                }
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in get sort type", () => { })
            });
    }

    private UpdateNumberOfElementsOnPage(folderName: string, folderPath: string, pageNum: number, onSuccess: () => void, onError: () => void): void {
        this.folderContentService.GetNumberOfElementsOnPage(folderName, folderPath, this.isSearchResult()).subscribe(
            numberOfElementOnPage => {
                this._view.numberOfElementsOnPage = numberOfElementOnPage;
                if (onSuccess !== null && onSuccess != undefined) {
                    onSuccess();
                }
            },
            error => {
                if (onError !== null && onError != undefined) {
                    onError();
                }
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in get number of elements on page", () => { })
            });
    }

    private updateFolder(folderName: string, folderPath: string, pageNum: number, sortType: sortType, onSuccess: () => void, onError: () => void): void {
        this.folderContentService.getFolder(folderName, folderPath, pageNum).subscribe(
            folder => {
                this.sortFolderContent(sortType, folder);
                this._view.listOfFileFolderNames = folder;
                this._view.navBarPath = this.getCurrentPath();
                this._view.updateNumberOfElementsOnPageOptions();
                if (onSuccess !== null && onSuccess != undefined) {
                    onSuccess();
                }
            },
            error => {
                if (onError !== null && onError != undefined) {
                    onError();
                }
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in update folder content", () => { })
            });
    }

    public updateCurrentFolderMetadata(sortType: sortType, numOfElementOnPage: number) {
        this._view.loading = true;
        let currentFolder = this.getCurrentFolder();
        this.folderContentService.updateFolderMetadata(currentFolder.Name, currentFolder.Path, sortType, numOfElementOnPage).subscribe(
            success => {
                this.updateFolderContentWithCurrentPage();
            },
            error => {
                this._view.loading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in update", () => { })
            });
    }

    public search(name: string, page: number) {
        this._view.loading = true;
        this.folderContentService.search(name, page).subscribe(
            folder => {
                this.folderContentService.UpdateNumberOfPagesForFolder(name, '', true);
                this._view.listOfFileFolderNames = folder;
                this._view.navBarPath = `search for: ${name}`;
                this._view.updateNumberOfElementsOnPageOptions();
                this._view.updateRefreshButtonState();
                this._view.loading = false;
            }
        );
    }

    public updateThisFolderContentAfterOperation(pageNum: number) {
        if (this.isSearchResult()) {
            let searchString = this.folderContentService.getContaningFolderPathFromPath(this.getCurrentPath());
            this.search(searchString, pageNum);
            return;
        }

        this.updateFolderContent(this.folderContentService.getContaningFolderNameFromPath(this.getCurrentPath()),
            this.folderContentService.getContaningFolderPathFromPath(this.getCurrentPath()),
            pageNum);
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

    public goToPath(path: string) {
        let folderName = this.folderContentService.getContaningFolderNameFromPath(path);
        let folderPath = this.folderContentService.getContaningFolderPathFromPath(path);
        this._view.currentPage = 1;
        this.updateFolderContent(folderName, folderPath, 1);
    }

    public saveState() {
        this.folderContentStateService.setCurrentFolderState(this.getCurrentFolder(), this._view.currentPage);
    }

    public restoreState(): void {
        let state = this.folderContentStateService.restoreFolderState()
        this._view.currentPage = state.currentPage;
        this.updateFolderContent(state.currentFolderName, state.currentFolderPath, state.currentPage);
    }

    public canActive() {
        return this.folderContentService.isInitialized();
    }

    //Private methods:

    private sortFolderContent(sort: sortType, folder: IFolder): void {
        let list = folder.Content;
        if (list === null || list === undefined) return;

        list.sort((fc1: IFolderContent, fc2: IFolderContent) => {
            if (sort === sortType.name) {
                if (fc1.Name > fc2.Name) return 1;
                if (fc1.Name < fc2.Name) return -1;
            }
            if (sort === sortType.dateCreated) {
                if (fc1.CreationTime > fc2.CreationTime) return 1;
                if (fc1.CreationTime < fc2.CreationTime) return -1;
            }
            if (sort === sortType.dateModified) {
                if (fc1.ModificationTime > fc2.ModificationTime) return 1;
                if (fc1.ModificationTime < fc2.ModificationTime) return -1;
            }
            if (sort === sortType.type) {
                if (fc1.Type > fc2.Type) return 1;
                if (fc1.Type < fc2.Type) return -1;
            }
            return 0;
        })
    }

    private getCurrentPath(): string {
        if (this._view.listOfFileFolderNames == undefined) {
            return 'home/';
        }
        if (this._view.listOfFileFolderNames.Path === '') return this._view.listOfFileFolderNames.Name;
        return `${this._view.listOfFileFolderNames.Path}/${this._view.listOfFileFolderNames.Name}`;
    }


    public isSearchResult(): boolean {
        if (this._view.listOfFileFolderNames === undefined || this._view.listOfFileFolderNames === null) {
            return false;
        }
        return this._view.listOfFileFolderNames.Type === folderContentType.folderPageResult;
    }

    private getCurrentFolder(): IFolder {
        let result = new FolderObj();
        if (this._view.listOfFileFolderNames == undefined) {
            result.Name = 'home';
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else if (this._view.listOfFileFolderNames.Path === '') {
            result.Name = this._view.listOfFileFolderNames.Name;
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else {
            result.Name = this._view.listOfFileFolderNames.Name;
            result.Path = this._view.listOfFileFolderNames.Path;
            result.Content = new Array<IFolderContent>();
        }

        return result;
    }

    private updateFolderContentWithCurrentPage() {
        this.updateThisFolderContentAfterOperation(this._view.currentPage);
    };

    //Events:
    public deleteFolderContent(selected: IFolderContent) {
        this._view.showMessage("Are you sure you want delete?", MessageBoxType.Question, MessageBoxButton.YesNo, "Delete", () => {
            if (this._view.messageBoxResult === DialogResult.No) return;
            this._view.loading = true;
            if (selected.Type === folderContentType.folder) {
                this.folderContentService.deleteFolder(selected.Name, selected.Path, this._view.currentPage).subscribe(
                    data => this.updateThisFolderContentAfterOperation(this._view.currentPage),
                    error => {
                        this._view.loading = false;
                        this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Delete", () => { })
                    }
                );
            }
            if (selected.Type === folderContentType.file) {
                this.folderContentService.deleteFile(selected.Name, selected.Path, this._view.currentPage).subscribe(
                    data => this.updateThisFolderContentAfterOperation(this._view.currentPage),
                    error => {
                        this._view.loading = false;
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
        this._view.loading = true;
        this.folderContentService.downloadFile(selected.Name, selected.Path);
        this._view.loading = false;
    }

    public createFolder(folderName: string) {
        this._view.loading = true;
        let resp = this.folderContentService.createFolder(folderName, this.getCurrentPath());
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(this._view.currentPage),
            error => {
                this._view.loading = false;
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder", () => { });
            })
    }

    public rename(selected: IFolderContent, newName: string) {
        this._view.loading = true;
        let resp = this.folderContentService.renameFolderContent(selected.Name, selected.Path, selected.Type, newName);
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(this._view.currentPage),
            error => {
                this._view.loading = false;
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Rename", () => { });
            })
    }

    public addFile(uploadArgs: IUploadArgs, onError: (errorMessage) => void) {
        this.folderContentService.createFile(
            uploadArgs.fileNameWithExtention,
            this.getCurrentPath(),
            uploadArgs.fileType,
            uploadArgs.fileStream,
            uploadArgs.fileSize,
            uploadArgs.file,
            this.updateFolderContentWithCurrentPage.bind(this),
            onError);
    }

    public paste(copyTo: IFolderContent) {
        let letClipBoardOperation = this.clipboard.popClipBoardOperation();
        let objTocopy = this.clipboard.popClipBoardObj();

        if (copyTo === null || copyTo === undefined) {
            copyTo = this.getCurrentFolder();
        }

        if (this.folderContentService.createPath(copyTo.Name, copyTo.Path) === objTocopy.Path) return;

        let respOfCopy = this.folderContentService.copy(objTocopy, <IFolder>copyTo);
        this._view.loading = true;
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

                    respOfDelete.subscribe(data => this.updateThisFolderContentAfterOperation(this._view.currentPage),
                        error => {
                            this._view.loading = false;
                            this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: delete old folder", () => { });
                        });
                }
                else {
                    this.updateThisFolderContentAfterOperation(this._view.currentPage);
                }

            },
            error => {
                this._view.loading = false;
                this._view.showMessage(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder", () => { });
            })
    }
}