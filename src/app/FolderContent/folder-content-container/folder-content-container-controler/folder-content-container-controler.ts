import { IFolderContentContainerView } from "./ifolder-content-container-view";
import { Injectable } from "@angular/core";
import { FolderContnentService } from "../../services/folder-content-service/folder-content-service";
import { FolderContentStateService } from "../../services/folder-content-state-service/folder-content-state-service";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { sortType } from "../../Model/sortType";
import { IFolderContent } from "../../Model/IFolderContent";
import { IFolder } from "../../Model/IFolder";
import { folderContentType } from "../../Model/folderContentType";
import { FolderObj } from "../../Model/FolderObj";
import { IUploadArgs } from "../../upload-form.component/iupload-args";


@Injectable({
    providedIn: "root"
})
export class FolderContentContainerControler {

    private _view: IFolderContentContainerView;
    constructor(
        private folderContentService: FolderContnentService,
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
                        this.folderContentService.UpdateNumberOfPagesForFolder(folderName, folderPath, this.isSearchResult());
                        this._view.updateRefreshButtonState();
                        this._view.currentPath = this.getCurrentPath();
                    },
                    cancelLoading);
            },
            cancelLoading);
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
                if (onSuccess !== null && onSuccess !== undefined) {
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

    public search(name: string, page: number) {
        this._view.loading = true;
        this.folderContentService.search(name, page).subscribe(
            folder => {
                this.folderContentService.UpdateNumberOfPagesForFolder(name, '', true);
                this._view.listOfFileFolderNames = folder;
                this._view.navBarPath = `search for: ${name}`;
                this._view.updateNumberOfElementsOnPageOptions();
                this._view.numberOfElementsOnPage = 20;
                this._view.updateRefreshButtonState();
                this._view.currentPath = this.getCurrentPath();
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

    public getCurrentPath(): string {
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

    public getCurrentFolder(): IFolder {
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

    public updateFolderContentWithCurrentPage() {
        this.updateThisFolderContentAfterOperation(this._view.currentPage);
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
}