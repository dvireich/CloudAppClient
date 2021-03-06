import { FolderContnentService } from "../../../services/folder-content-service/folder-content-service";
import { Component, Input, OnDestroy } from "@angular/core";
import { IUploadData } from "../../../Model/IUploadData";

@Component({
    selector: "upload-progress-row",
    templateUrl: "./upload-progress-row.component.html",
    styleUrls: ["./upload-progress-row.component.css"]
})
export class UploadProgressRow implements OnDestroy {
    ngOnDestroy(): void {
        this.folderContentService.removeSubscribeToChangeInUploadProgress(this)
    }

    constructor(private folderContentService: FolderContnentService) {
        folderContentService.subscribeToChangeInUploadProgress(this, this.onProgress.bind(this))
    }

    private progress: number = 0;
    private _uploadData: IUploadData;
    private uploadEnded: boolean;

    @Input()
    set uploadData(value: IUploadData) {
        this._uploadData = value;
        if (this.uploadData.progress < 100) return;

        this.uploadEnded = true;
        this.buttonName = "Clear";
    }

    onProgress() {
        let currentElementArray = this.folderContentService.getUploadProgress().filter(
            element =>
              element.fileName === this._uploadData.fileName &&
              element.path === this._uploadData.path);

        if (currentElementArray.length !== 1) {
            console.log(`For request id: ${this._uploadData.path}_${this._uploadData.fileName}
            there is more than 1 elements or 0 elements: ${currentElementArray}`);
        }

        if (currentElementArray[0].progress < 100) return;

        this.uploadEnded = true;
        this.buttonName = "Clear";
    }

    get uploadData(): IUploadData {
        return this._uploadData;
    }

    buttonName: string = "Cancel";

    onButtonClick() {
        if(this.buttonName === 'Cancel'){
            this.folderContentService.cancelUpload(
              this._uploadData.fileName,
              this._uploadData.path);
        }

        if (this.buttonName === 'Clear') {

            this.folderContentService.clearUpload(
              this._uploadData.fileName,
              this._uploadData.path);
        };
    }

    fixNameToShow(value: string): string{
        if(value.length > 7){
            return value.substring(0, 7) + "...";
        }

        return value;
    }
}
