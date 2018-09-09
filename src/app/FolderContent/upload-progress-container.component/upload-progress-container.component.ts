import { Component, Input } from "@angular/core";
import { FolderContnentService } from "../FolderContentService/folder-content-service";
import { IUploadData } from "../../Common/uploadProgress.component/IuploadData";

@Component({
    selector: "upload-progress-container",
    templateUrl: "./upload-progress-container.component.html",
    styleUrls: ["./upload-progress-container.component.css"]
})
export class UploadProgressContainer {
    constructor(private folderContentService: FolderContnentService) {
        folderContentService.subscriberToCreateUploadToAction(this, this.onCreateUpload.bind(this));
        this.onCreateUpload();
    }

    duringUpdate: boolean;

    @Input() maxColumns: number = 4;
    private uploads: IUploadData[];
    private uploadsToMaxColumns: IUploadData[][];

    onCreateUpload() {
        this.uploads = this.folderContentService.getUploadProgress();
        this.InitializeUploadsToMaxColumns();
    }

    private InitializeUploadsToMaxColumns() {
        this.uploadsToMaxColumns = [];
        for (let i: number = 0; i < this.uploads.length; i = i + this.maxColumns) {
            let tmpArray: IUploadData[] = new Array<IUploadData>();
            for (let j: number = 0; j < this.maxColumns && i + j < this.uploads.length; j++) {
                tmpArray.push(this.uploads[i + j])
            }
            this.uploadsToMaxColumns.push(tmpArray);
        }
    }
}