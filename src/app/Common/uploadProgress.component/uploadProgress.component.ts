import { Component, Input } from "@angular/core";

@Component({
    selector: "upload-progress",
    templateUrl: "./uploadProgress.component.html",
     styleUrls: ["./uploadProgress.component.css"]
})
export class UploadProgress{

 @Input()  progress: number = 100;
}