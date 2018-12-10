import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ContexMentuItem } from "../../../Common/multi-level-contex-menu/contex-menu.component/contex-mentu-item";
import { IContexMentuItem } from "../../../Common/multi-level-contex-menu/contex-menu.component/icontex-mentu-item";
import { IFolderContent } from "../../Model/IFolderContent";
import { folderContentType } from "../../Model/folderContentType";
import { sortType } from "../../Model/sortType";
import { FolderContentInputArgs } from "../../helper-classes/folder-content-input-box-args";
import { FolderContentMessageBoxArgs } from "../../helper-classes/folder-content-message-box-args";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { IFolderContentContexMenuView } from "../folder-content-contex-menu.controler/ifolder-content-contex-menu-view";
import { FolderContentContexMenuControler } from "../folder-content-contex-menu.controler/folder-content-contex-menu.controler";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { ContexMenuType } from "../../helper-classes/contex-menu-type";

@Component({
    selector: 'folder-content-contex-menu',
    templateUrl: 'folder-content-contex-menu.component.html',
    styleUrls: ['folder-content-contex-menu.component.css']
})
export class FolderContentContexMenu implements IFolderContentContexMenuView {
    
    @Input() selectedFolderContentItem: IFolderContent;
    @Input() numberOfElementsOnPage: number;
    @Input() currentPage: number;
    @Input() currentPath: string;
    @Input() x: number;
    @Input() y: number;
    @Input() messageBoxResult: DialogResult;
    @Input() public set contexMenuType(type: ContexMenuType) {
        if(type === ContexMenuType.folderContentContexMenu){
            this.contexMenuItems = this.getContexMentuItemsForFolderContentRClick();
        }
        else if(type === ContexMenuType.emptySpaceClickContexMenu){
            this.contexMenuItems = this.getContexMentuItemsForFolderContentContainerRClick(); 
        }
    }

    @Output() needToShowUploadBox: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() needToShowInputBox: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() needToLoadingLayer: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() clearNavBarSearchText: EventEmitter<void> = new EventEmitter<void>();
    @Output() showInputBox: EventEmitter<FolderContentInputArgs> = new EventEmitter<FolderContentInputArgs>();
    @Output() showMessageBox: EventEmitter<FolderContentMessageBoxArgs> = new EventEmitter<FolderContentMessageBoxArgs>();
    contexMenuItems: IContexMentuItem[] = [];

    constructor(private controler: FolderContentContexMenuControler) {
        controler.initializeView(this);
    }

    onDeleteContexMenuClick() {
        this.controler.deleteFolderContent(this.selectedFolderContentItem);
    }

    inputBoxOnCancel() {
        this.needToShowInputBox.emit(false);
    }

    onRenameContexMenuClick() {
        let args = new FolderContentInputArgs("Enter the new name...", "Rename", "Rename", this.inputBoxRename(this.selectedFolderContentItem), this.inputBoxOnCancel, () => { });
        this.showInputBox.emit(args);
    }

    onCopyContexMenuClick() {
        this.controler.copy(this.selectedFolderContentItem);
    }

    onCutContexMenuClick() {
        this.controler.cut(this.selectedFolderContentItem);
    }

    onPasteContexMenuClick() {
        this.controler.paste(this.selectedFolderContentItem);
    }

    onCreateNewFolderContexMenuClick() {
        let args = new FolderContentInputArgs("Enter folder name...", "Create Folder", "Create", this.inputBoxCreateNewFolder.bind(this), this.inputBoxOnCancel.bind(this), () => { });
        this.showInputBox.emit(args);
    }

    onSortByNameContexMenuClick() {
        this.controler.updateCurrentFolderMetadata(sortType.name, this.numberOfElementsOnPage);
    }

    onSortByCreationDateContexMenuClick() {
        this.controler.updateCurrentFolderMetadata(sortType.dateCreated, this.numberOfElementsOnPage);
    }

    onSortByModificationDateContexMenuClick() {
        this.controler.updateCurrentFolderMetadata(sortType.dateModified, this.numberOfElementsOnPage);
    }

    onSortByTypeContexMenuClick() {
        this.controler.updateCurrentFolderMetadata(sortType.type, this.numberOfElementsOnPage);
    }

    onAddFile() {
        this.needToShowUploadBox.emit(true);
    }

    onDownloadFileClick() {
        this.controler.downloadFile(this.selectedFolderContentItem);
    }

    canPaste(): boolean {
        return this.controler.canPaste(this.selectedFolderContentItem);
    }

    enterFolder() {
        this.clearNavBarSearchText.emit();
        this.controler.enterFolder(this.selectedFolderContentItem.Name, this.selectedFolderContentItem.Path, 1);
    }

    inputBoxCreateNewFolder(folderName: string) {
        this.needToShowInputBox.emit(false);

        if (!this.validateNotEmptyStringAndShowMessageBox(folderName, "The folder name cannot be empty")) return;
        this.controler.createFolder(folderName);
    }

    inputBoxRename(selected: IFolderContent): (input: string) => void {
        return (newName: string) => {
            this.needToShowInputBox.emit(false);
            if (!this.validateNotEmptyStringAndShowMessageBox(newName, "The new name cannot be empty")) return;

            if (selected.Type === folderContentType.file) {
                let fileExtentionIndex = selected.Name.lastIndexOf('.');
                let fileExtention = selected.Name.substring(fileExtentionIndex);
                newName = newName + fileExtention;
            }
            this.controler.rename(selected, newName);
        }
    }

    validateNotEmptyStringAndShowMessageBox(str: string, errorMessage: string): boolean {
        if (str === "" || str === undefined) {
            this.showMessage(errorMessage, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder", () => { });
            return false;
        }

        return true;
    }

    getContexMentuItemsForFolderContentRClick(): IContexMentuItem[] {
        let deleteToEvent = new ContexMentuItem();
        deleteToEvent.onClick = this.onDeleteContexMenuClick.bind(this);
        deleteToEvent.name = "Delete";
        deleteToEvent.needToshow = () => true;
        deleteToEvent.showAllways = true;
        deleteToEvent.styleClasses = ["glyphicon", "glyphicon-trash"];

        let renameToEvent = new ContexMentuItem();
        renameToEvent.onClick = this.onRenameContexMenuClick.bind(this);
        renameToEvent.name = "Rename";
        renameToEvent.needToshow = () => true;
        renameToEvent.showAllways = true;
        renameToEvent.styleClasses = ["glyphicon", "glyphicon-retweet"];

        let copyToEvent = new ContexMentuItem();
        copyToEvent.onClick = this.onCopyContexMenuClick.bind(this);
        copyToEvent.name = "Copy";
        copyToEvent.needToshow = () => true;
        copyToEvent.showAllways = true;
        copyToEvent.styleClasses = ["glyphicon", "glyphicon-copy"];

        let cutToEvent = new ContexMentuItem();
        cutToEvent.onClick = this.onCutContexMenuClick.bind(this);
        cutToEvent.name = "Cut";
        cutToEvent.needToshow = () => true;
        cutToEvent.showAllways = true;
        cutToEvent.styleClasses = ["glyphicon ", "glyphicon-duplicate"];

        let pasteToEvent = new ContexMentuItem();
        pasteToEvent.onClick = this.onPasteContexMenuClick.bind(this);
        pasteToEvent.name = "Paste";
        pasteToEvent.needToshow = (() => { return (this.isFolder() && this.canPaste()); }).bind(this);
        pasteToEvent.showAllways = false;
        pasteToEvent.styleClasses = ["glyphicon", "glyphicon-paste"];

        let enterToEvent = new ContexMentuItem();
        enterToEvent.onClick = this.enterFolder.bind(this);
        enterToEvent.name = "Enter";
        enterToEvent.needToshow = this.isFolder.bind(this);;
        enterToEvent.showAllways = false;
        enterToEvent.styleClasses = ["glyphicon", "glyphicon-level-up"];

        let downloadToEvent = new ContexMentuItem();
        downloadToEvent.onClick = this.onDownloadFileClick.bind(this);
        downloadToEvent.name = "Download";
        downloadToEvent.needToshow = (() => { return (!this.isFolder()); }).bind(this);
        downloadToEvent.showAllways = false;
        downloadToEvent.styleClasses = ["glyphicon", "glyphicon-cloud-download"];


        return [deleteToEvent,
            copyToEvent,
            renameToEvent,
            cutToEvent,
            pasteToEvent,
            downloadToEvent,
            enterToEvent];
    }

    getContexMentuItemsForFolderContentContainerRClick(): IContexMentuItem[] {
        let createNewFolderToEvent = new ContexMentuItem();
        createNewFolderToEvent.onClick = this.onCreateNewFolderContexMenuClick.bind(this);
        createNewFolderToEvent.name = "Create New Folder";
        createNewFolderToEvent.needToshow = () => true;
        createNewFolderToEvent.showAllways = true;
        createNewFolderToEvent.styleClasses = ["glyphicon", "glyphicon-folder-open"];

        let pasteToEvent = new ContexMentuItem();
        pasteToEvent.onClick = this.onPasteContexMenuClick.bind(this);
        pasteToEvent.name = "Paste";
        pasteToEvent.needToshow = this.canPaste.bind(this);
        pasteToEvent.showAllways = false;
        pasteToEvent.styleClasses = ["glyphicon", "glyphicon-paperclip"];

        let addFileToEvent = new ContexMentuItem();
        addFileToEvent.onClick = this.onAddFile.bind(this);
        addFileToEvent.name = "Add File";
        addFileToEvent.needToshow = () => true;
        addFileToEvent.showAllways = true;
        addFileToEvent.styleClasses = ["glyphicon", "glyphicon-cloud-upload"];

        return [createNewFolderToEvent,
            pasteToEvent,
            this.createSortByContexMenu(),
            addFileToEvent];
    }

    createSortByContexMenu() {
        let sortByName = new ContexMentuItem();
        sortByName.onClick = this.onSortByNameContexMenuClick.bind(this);
        sortByName.name = "Name";
        sortByName.needToshow = () => true;
        sortByName.showAllways = true;

        let sortByType = new ContexMentuItem();
        sortByType.onClick = this.onSortByTypeContexMenuClick.bind(this);
        sortByType.name = "Type";
        sortByType.needToshow = () => true;
        sortByType.showAllways = true;

        let sortByCreationDate = new ContexMentuItem();
        sortByCreationDate.onClick = this.onSortByCreationDateContexMenuClick.bind(this);
        sortByCreationDate.name = "Creation Date";
        sortByCreationDate.needToshow = () => true;
        sortByCreationDate.showAllways = true;

        let sortByModificationDate = new ContexMentuItem();
        sortByModificationDate.onClick = this.onSortByModificationDateContexMenuClick.bind(this);
        sortByModificationDate.name = "Modification Date";
        sortByModificationDate.needToshow = () => true;
        sortByModificationDate.showAllways = true;

        let changeSortToEvent = new ContexMentuItem();
        changeSortToEvent.onClick = () => { };
        changeSortToEvent.name = "Sort by";
        changeSortToEvent.needToshow = () => true;
        changeSortToEvent.showAllways = true;
        changeSortToEvent.subs = [
            sortByName,
            sortByType,
            sortByCreationDate,
            sortByModificationDate
        ]

        return changeSortToEvent;
    }

    private isFolder(): boolean {
        if (this.selectedFolderContentItem === null || this.selectedFolderContentItem === undefined) return false;

        return this.selectedFolderContentItem.Type === folderContentType.folder;
    }

    showMessage(message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont: () => void) {
        let args = new FolderContentMessageBoxArgs(message, type, buttons, caption, cont);
        this.showMessageBox.emit(args);
    }

    showLoadingLayer(show: boolean){
        this.needToLoadingLayer.emit(show);
    }
}