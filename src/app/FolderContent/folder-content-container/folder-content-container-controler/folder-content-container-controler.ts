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
import { VideoArgs } from "../../helper-classes/video-args";


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
    // Public methods:

    public initializeView(view: IFolderContentContainerView) {
        this._view = view;
    }

    public logout() {
        this.folderContentService.logout();
    }

    public updateFolderContent(folderName: string, folderPath: string, pageNum: number): void {
        this._view.loading = true;
        const cancelLoading = () => {this._view.loading = false; };
        this.UpdateSortForFolder(folderName, folderPath, pageNum,
            () => {
                this.updateFolder(folderName, folderPath, pageNum, this._view.currentSortType,
                    () => {
                        this.UpdateNumberOfElementsOnPage(folderName, folderPath, pageNum, cancelLoading, cancelLoading)
                        this.folderContentService.UpdateNumberOfPagesForFolder(folderName, folderPath, this.isSearchResult());
                        this._view.updateRefreshButtonState();
                        this._view.currentPath = this.getCurrentPath();
                        console.log(this._view.currentPath);
                    },
                    cancelLoading);
            },
            cancelLoading);
    }

    private UpdateSortForFolder(folderName: string, folderPath: string, pageNum: number, onSuccess: () => void, onError: () => void): void {
        this.folderContentService.GetSortForFolder(folderName, folderPath).subscribe(
            sortType => {
                this._view.currentSortType = sortType;
                if (onSuccess !== null && onSuccess !== undefined) {
                    onSuccess();
                }
            },
            error => {
                if (onError !== null && onError !== undefined) {
                    onError();
                }
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in get sort type", () => { })
            });
    }

    private UpdateNumberOfElementsOnPage(folderName: string, folderPath: string, pageNum: number, onSuccess: () => void, onError: () => void): void {
        this.folderContentService.GetNumberOfElementsOnPage(folderName, folderPath, this.isSearchResult()).subscribe(
            numberOfElementOnPage => {
                this._view.numberOfElementsOnPage = numberOfElementOnPage;
                if (onSuccess !== null && onSuccess !== undefined) {
                    onSuccess();
                }
            },
            error => {
                if (onError !== null && onError !== undefined) {
                    onError();
                }

                this._view.showMessage(
                  error,
                  MessageBoxType.Error,
                  MessageBoxButton.Ok,
                  'Error in get number of elements on page',
                  () => { });
            });
    }

    private updateFolder(
      folderName: string,
      folderPath: string,
      pageNum: number,
      sortType: sortType,
      onSuccess: () => void,
      onError: () => void): void {
        this.folderContentService.getFolder(folderName, folderPath, pageNum).subscribe(
            folder => {
                this.sortFolderContent(sortType, folder);
                console.log(folder);
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
            const searchString = this.folderContentService.getContainingFolderPathFromPath(this.getCurrentPath());
            this.search(searchString, pageNum);
            return;
        }

        this.updateFolderContent(this.folderContentService.getContainingFolderNameFromPath(this.getCurrentPath()),
            this.folderContentService.getContainingFolderPathFromPath(this.getCurrentPath()),
            pageNum);
    }

    public goToPath(path: string) {
        const folderName = this.folderContentService.getContainingFolderNameFromPath(path);
        const folderPath = this.folderContentService.getContainingFolderPathFromPath(path);
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
      const folderName = this._view.listOfFileFolderNames.Name;
      const folderPath = this._view.listOfFileFolderNames.RelativePath;

        if (folderPath === undefined ||
            folderName === 'home\\' ||
            folderPath === '') {
            return 'home\\';
        }

        return `${folderPath}\\${folderName}`;
    }

    public isSearchResult(): boolean {
        if (this._view.listOfFileFolderNames === undefined || this._view.listOfFileFolderNames === null) {
            return false;
        }
        return this._view.listOfFileFolderNames.Type === folderContentType.folderPageResult;
    }

    // Private methods:
    private sortFolderContent(sort: sortType, folder: IFolder): void {
        let list = folder.CurrentContentPage;
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
        });
    }

    public getCurrentFolder(): IFolder {
        const result = new FolderObj();
        if (this._view.listOfFileFolderNames === undefined) {
            result.Name = 'home';
            result.RelativePath = '';
            result.CurrentContentPage = new Array<IFolderContent>();
        }
        else if (this._view.listOfFileFolderNames.RelativePath === '') {
            result.Name = this._view.listOfFileFolderNames.Name;
            result.RelativePath = '';
            result.CurrentContentPage = new Array<IFolderContent>();
        }
        else {
            result.Name = this._view.listOfFileFolderNames.Name;
            result.RelativePath = this._view.listOfFileFolderNames.RelativePath;
            result.CurrentContentPage = new Array<IFolderContent>();
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
        this.folderContentService.updateFolderMetadata(
          currentFolder.Name,
          currentFolder.RelativePath,
          sortType,
          numOfElementOnPage).subscribe(
            success => {
                this.updateFolderContentWithCurrentPage();
            },
            error => {
                this._view.loading = false;
                this._view.showMessage(error, MessageBoxType.Error, MessageBoxButton.Ok, "Error in update", () => { })
            });
    }

    public openFile(name: string, path: string){
        if(this.isVideo(name)){
            this.openVideo(name, path);
        }
    }

    public canOpenFile(name: string, type: folderContentType){
        return !this.isFolder(type) && this.isVideo(name);
    }

    public isFolder(type: folderContentType): boolean {
        return type === folderContentType.folder;
    }

    private openVideo(name: string, path: string){
        const playVideo = ((downloadUrl: string)=>{
            let videoArgs = new VideoArgs(downloadUrl, true);
            this._view.showVideo(videoArgs);
        }).bind(this);
        this.folderContentService.performOnFileDonwloadLink(name, path, playVideo);
    }

    private isVideo(filename) : boolean {
        var ext = this.getExtension(filename);
        switch (ext.toLowerCase()) {
        case 'm4v': case 'avi': case 'mp4': case 'mkv': case 'webm':case 'mov':
            return true;
        }
        return false;
    }

    private getExtension(filename) {
        var parts = filename.split('.');
        return parts[parts.length - 1];
    }
}
