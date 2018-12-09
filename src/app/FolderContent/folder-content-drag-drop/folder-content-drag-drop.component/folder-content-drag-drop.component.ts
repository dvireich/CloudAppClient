import { Component, Output, EventEmitter } from "@angular/core";
import { IFolderContentDragAndDropView } from "../folder-content-drag-drop.controler/folder-content-drag-drop-view";
import { FolderContentDragAndDropControler } from "../folder-content-drag-drop.controler/folder-content-drag-drop.controler";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";

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


    onDrop(files: File[]){
        files.forEach(file => {
            this.controler.addFile(file, this.onErrorHandler.bind(this));
        });
    }

    onErrorHandler(message: string){
        this.onError.emit(message);
        this.onDropEnd.emit();
    }
}