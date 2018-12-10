import { Component, Output, EventEmitter, Input } from "@angular/core";
import { IFolderContentDragAndDropView } from "../folder-content-drag-drop.controler/folder-content-drag-drop-view";
import { FolderContentDragAndDropControler } from "../folder-content-drag-drop.controler/folder-content-drag-drop.controler";

@Component({
    selector: "folder-content-drag-and-drop",
    templateUrl: "./folder-content-drag-drop.component.html",
    styleUrls: ["./folder-content-drag-drop.component.css"]
})
export class FolderContentDragAndDrop implements IFolderContentDragAndDropView{
    constructor(private controler: FolderContentDragAndDropControler){
        controler.initializeView(this);
    }

    @Output() onDropEnd: EventEmitter<void> = new EventEmitter<void>();
    @Output() onError: EventEmitter<string> = new EventEmitter<string>();
    @Input()  currentPath: string;
    @Output() updateViewOnSuccess : EventEmitter<void> = new EventEmitter<void>();

    onDrop(files: File[]){
        this.onDropEnd.emit();
        files.forEach(file => {
            this.controler.addFile(file, this.onErrorHandler.bind(this), this.onUpdateViewOnSuccess.bind(this), this.currentPath);
        });
    }

    onErrorHandler(message: string){
        this.onError.emit(message);
        this.onDropEnd.emit();
    }

    onUpdateViewOnSuccess(){
        this.updateViewOnSuccess.emit();
    }
}