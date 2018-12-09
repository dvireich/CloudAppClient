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

    messageBoxText: string;
    messageBoxResult: DialogResult;
    needToShowMessageBox: boolean;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    onMessageBoxClick(action: (result: DialogResult) => void, cont: () => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (result: DialogResult) => {
            bindedAction(result);
            bindedCont();
        }
    }

    onMessageBoxCancel(result: DialogResult) {
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    onMessageBoxOk(result: DialogResult) {
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    showMessageBox(message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont: () => void = () => { }) {
        this.messageBoxOnButton1Click = this.onMessageBoxClick(this.onMessageBoxOk, cont).bind(this);
        this.messageBoxOnButton2Click = this.onMessageBoxClick(this.onMessageBoxCancel, cont).bind(this);
        this.messageBoxMessageType = type;
        this.messageBoxText = message;
        this.messageBoxButtons = buttons;
        this, this.messageBoxCaption = caption;
        this.needToShowMessageBox = true;
    }

    showMessage(
        message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void) {
        this.showMessageBox(message, type, buttons, caption, cont);
    }

    onDrop(files: File[]){
        files.forEach(file => {
            this.controler.addFile(file);
        });
        this.onDropEnd.emit();
    }

    onError(message: string){
        this.showMessage(message, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Drag and drop", ()=>{});
    }
}