import { Component, Input, OnDestroy } from "@angular/core";
import { IUploadData } from "./IUploadData";
import { FolderContnentService } from "../../FolderContent/FolderContentService/folder-content-service";
import { element } from "@angular/core/src/render3/instructions";

@Component({
    selector: "upload-progress",
    templateUrl: "./uploadProgress.component.html",
    styleUrls: ["./uploadProgress.component.css"]
})
export class UploadProgress implements OnDestroy {
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
            element => element.requestId === this._uploadData.requestId);

        if (currentElementArray.length !== 1) {
            console.log(`For request id: ${this._uploadData.requestId} there is more than 1 elements or 0 elements: ${currentElementArray}`)
        }

        if (currentElementArray[0].progress < 100) return;

        this.uploadEnded = true;
        this.buttonName = "Clear";
    }

    get uploadData(): IUploadData {
        return this._uploadData;
    }

    private buttonName: string = "Cancel";

    onButtonClick() {
        this.folderContentService.clearUpload(this._uploadData.requestId);
    }

    fixNameToShow(value: string): string{
        if(value.length > 7){
            return value.substring(0, 7) + "...";
        }

        return value;
    }
}