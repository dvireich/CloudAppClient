import { Component, Input } from "@angular/core";
import { IUploadData } from "./IUploadData";
import { FolderContnentService } from "../../FolderContent/FolderContentService/folder-content-service";

@Component({
    selector: "upload-progress",
    templateUrl: "./uploadProgress.component.html",
    styleUrls: ["./uploadProgress.component.css"]
})
export class UploadProgress {

    constructor(private folderContentService: FolderContnentService) {

    }

    private progress: number = 0;
    private _uploadData: IUploadData;
    private uploadEnded: boolean;

    @Input()
    set uploadData(value: IUploadData) {
        this._uploadData = value;
        if (this._uploadData.progress === 100) {
            this.uploadEnded = true;
            this.buttonName = "Clear";
        }
    }

    get uploadData(): IUploadData {
        return this._uploadData;
    }

    private buttonName: string = "Cancel";

    onButtonClick() {
        console.log("click");
        if (this.uploadEnded) {
            this.folderContentService.finishUpload(this._uploadData.requestId);
        }
        else {
            this.folderContentService.cancelUpload(this._uploadData.requestId);
        }
    }


}