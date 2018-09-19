import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { FolderContentStateService } from "../../folder-content-state-service/folder-content-state-service";
import { UploadContainerState } from "../../folder-content-state-service/upload-container-state";
import { FolderContnentService } from "../../Folder-content-service/folder-content-service";
import { IUploadData } from "./upload-progress-row.component/IUploadData";



@Component({
    selector: "uploads-grid",
    templateUrl: "./uploads-grid.component.html",
    styleUrls: ["./uploads-grid.component.css"]
})
export class UploadsGrid implements OnDestroy, OnInit {
    ngOnInit(): void {
        let state = this.folderContentStateService.restoreUploadContainerState();
        if(state === null || state === undefined) return;

        this.height = state.Height;
        this.visibility = state.Visibility;
    }
    ngOnDestroy(): void {
        this.close();
        this.folderContentService.removeSubscriberToCreateUploadToAction(this);
    }
    constructor(private folderContentService: FolderContnentService,
                private folderContentStateService: FolderContentStateService,
                private router: Router) {
        folderContentService.subscriberToCreateUploadToAction(this, this.onCreateUpload.bind(this));
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.folderContentStateService.setUploadContainerState(new UploadContainerState(this.visibility, this.height));
            }
        this.UpdateUploadFromService();
    });
}

    @Input() maxColumns: number = 4;
    private uploads: IUploadData[];
    private uploadsToMaxColumns: IUploadData[][];
    private showUploadContainter: boolean = true;
    private height: string = "auto";
    private visibility: string = "hidden";

    onCreateUpload() {
        this.UpdateUploadFromService();
        if(this.uploads.length == 0){
            this.close();
            return;
        }
        this.showContainer();
    }

    UpdateUploadFromService() {
        this.uploads = this.folderContentService.getUploadProgress();
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

    changeUploadContainerWindow() {
        console.log("changeUploadContainerWindow");


        this.showUploadContainter = !this.showUploadContainter;
        if (this.showUploadContainter) {
            if(this.uploads.length > 2){
                this.height = "200px";
            }
            else{
                this.height="auto";
            }
           
        }
        else {
            this.height = "0";
        }
    }

    close() {
        this.visibility = "hidden";
    }

    showContainer() {
        if(this.uploads.length > 2){
            this.height = "200px";
        }
        else{
            this.height="auto";
        }
        this.visibility = "visible";
    }
}