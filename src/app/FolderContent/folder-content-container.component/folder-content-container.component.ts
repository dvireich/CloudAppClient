import { Component, OnInit, OnDestroy } from "@angular/core";
import { IFolderContent } from "../Model/IFolderContent";

import { IFolder } from "../Model/IFolder";
import { FolderObj } from "../Model/FolderObj";
import { folderContentType } from "../Model/folderContentType";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { Observable } from "rxjs";
import { Router, NavigationStart } from "@angular/router";
import { ISelecableProperties } from "../Model/ISelecableProperties";
import { SelectableGrid } from "../selectable-grid/selectalbe-grid.component/selectalbe-grid.component";
import { EnterFolderArgs } from "../selectable-grid/selectalbe-grid.component/select-able.component/enterFolderArgs";
import { FolderContentClipBoard } from "../clipboard-service/folder-content-clipboard";
import { ClipBoardOperation } from "../clipboard-service/clip-board-operation";
import { FolderContentStateService } from "../folder-content-state-service/folder-content-state-service";
import { FolderContnentService } from "../Folder-content-service/folder-content-service";
import { IContexMentuItem } from "../../Common/contex-menu.component/icontex-mentu-item";
import { IContexMenuCoordinates } from "../../Common/contex-menu.component/icontex-menu-coordinates";
import { ContexMentuItem } from "../../Common/contex-menu.component/contex-mentu-item";

@Component({
    selector: "folder-content-container",
    templateUrl: "./folder-content-container.component.html",
    styleUrls: ['./folder-content-container.component.css']
})
export class FolderContentContainter implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        this.folderContentService.removeSubscriberToFinishUploadToAction(this);
    }

    constructor(private folderContentService: FolderContnentService,
        private clipboard: FolderContentClipBoard,
        private folderContentStateService: FolderContentStateService,
        private router: Router) {
        folderContentService.subscriberToFinishUploadToAction(this, this.onFinishAddFile.bind(this));
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                folderContentStateService.setCurrentFolderState(this.getCurrentFolder(), this._currentPage);
            }
        });       
    }

    private ignoreDisableSelection: boolean;
    private ignoreOnRightClick: boolean;
    private _listOfFileFolderNames: IFolder;
    private _currentPage: number = 1;
    private selectedProperties: ISelecableProperties;

    //selectable-grid
    private _selectableGrid: SelectableGrid;

    //UploadBox
    needToShowUploadBox: boolean;
    uploadBoxCancel: () => void = this.uploadFileOnCancel;

    //NavBar
    navBarPath: string;
    navBarPathBreakClick: (fullPath: string) => void = this.navBarOnPathBreakClick;

    //ContexMenu
    showContexMenu: boolean;
    private contexMenuX: number;
    private contexMenuY: number;
    private contexMenuItems: IContexMentuItem[];

    //inputBox
    neddToShowInputBox: boolean;
    inputBoxHeader: string;
    inputBoxOkButtonName: string;
    inputBoxPlaceHolder: string;
    inputBoxOnCancelEvent: () => void;
    inputBoxOnSubmitEvent: (input: string) => void;

    //message box
    messageBoxResult: DialogResult;
    needToShowMessageBox: boolean;
    messageBoxText: string;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    ngOnInit(): void {
        let state = this.folderContentStateService.restoreFolderState()
        this._currentPage = state.currentPage;
        this.updateFolderContent(state.currentFolderName, state.currentFolderPath, state.currentPage);
    }

    private updateFolderContent(folderName: string, folderPath: string, pageNum: number): void {
        this.folderContentService.UpdateNumberOfPagesForFolder(folderName, folderPath);
        this.folderContentService.getFolder(folderName, folderPath, pageNum).subscribe(
            folder => {
                this._listOfFileFolderNames = folder;
                this.navBarPath = this.getCurrentPath();
            },
            error => this.messageBoxText = <any>error);
    }

    onDeleteContexMenuClick() {
        let selected = this.getSelected();
        this.showMessageBox("Are you sure you want delete?", MessageBoxType.Question, MessageBoxButton.YesNo, "Delete", () => {
            if (this.messageBoxResult === DialogResult.No) return;
            if (selected.Type === folderContentType.folder) {
                this.folderContentService.deleteFolder(selected.Name, selected.Path, this._currentPage).subscribe(
                    data => this.updateThisFolderContentAfterOperation(this._currentPage),
                    error => this.messageBoxText = <any>error
                );
            }
            if (selected.Type === folderContentType.file) {
                this.folderContentService.deleteFile(selected.Name, selected.Path, this._currentPage).subscribe(
                    data => this.updateThisFolderContentAfterOperation(this._currentPage),
                    error => this.messageBoxText = <any>error
                );
            }
        });
    }

    onRenameContexMenuClick() {
        this.showInputBox("Enter the new name...", "Rename", "Rename", this.inputBoxRename(this.getSelected()), this.inputBoxOnCancel, () => { });
    }

    onCoptyContexMenuClick() {
        let selected = this.getSelected();
        this.clipboard.AddToClipBoard(selected, ClipBoardOperation.Copy);
    }

    onCutContexMenuClick() {
        let selected = this.getSelected();
        this.clipboard.AddToClipBoard(selected, ClipBoardOperation.Cut);
    }

    getCurrentFolder(): IFolder {
        let result = new FolderObj();
        if (this._listOfFileFolderNames == undefined) {
            result.Name = 'home';
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else if (this._listOfFileFolderNames.Path === '') {
            result.Name = this._listOfFileFolderNames.Name;
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else {
            result.Name = this._listOfFileFolderNames.Name;
            result.Path = this._listOfFileFolderNames.Path;
            result.Content = new Array<IFolderContent>();
        }

        return result;
    }

    onPasteContexMenuClick() {
        let copyTo = this.getSelected();
        let letClipBoardOperation = this.clipboard.popClipBoardOperation();
        let objTocopy = this.clipboard.popClipBoardObj();

        if (copyTo === null || copyTo === undefined) {
            copyTo = this.getCurrentFolder();
        }

        if (this.folderContentService.createPath(copyTo.Name, copyTo.Path) === objTocopy.Path) return;

        let respOfCopy = this.folderContentService.copy(objTocopy, <IFolder>copyTo);

        respOfCopy.subscribe(
            data => {
                if (letClipBoardOperation === ClipBoardOperation.Cut) {

                    let respOfDelete: Observable<object>;
                    if (objTocopy.Type == folderContentType.folder) {
                        respOfDelete = this.folderContentService.deleteFolder(objTocopy.Name, objTocopy.Path, this._currentPage);
                    }
                    if (objTocopy.Type == folderContentType.file) {
                        respOfDelete = this.folderContentService.deleteFile(objTocopy.Name, objTocopy.Path, this._currentPage);
                    }

                    respOfDelete.subscribe(data => this.updateThisFolderContentAfterOperation(this._currentPage),
                        error => {
                            this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
                        });
                }
                else {
                    this.updateThisFolderContentAfterOperation(this._currentPage);
                }

            },
            error => {
                this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
            })
        console.log("Paste");
    }

    onCreateNewFolderContexMenuClick() {
        this.showInputBox("Enter folder name...", "Create Folder", "Create", this.inputBoxCreateNewFolder, this.inputBoxOnCancel, () => { });
    }

    clearSelectbleGridSelection(){
        this.hideContexMenu();
        this._selectableGrid.clearSelection();
        this.onSelectionChanged(null);
    }

    SetIgnoreOnRightClick() {
        this.ignoreOnRightClick = true;
    }

    SetIgnoreDisableSelection() {
        this.ignoreDisableSelection = true;
    }

    disableSelection() {
        if (this.ignoreDisableSelection) {
            this.ignoreDisableSelection = false;
            return;
        }
        this.clearSelectbleGridSelection();
    }

    hideContexMenu() {
        this.showContexMenu = false;
    }

    showContexMenuOnCoordinates(coordinates: IContexMenuCoordinates) {
        this.contexMenuX = coordinates.pageX;
        this.contexMenuY = coordinates.pageY;
        this.contexMenuItems = this.getContexMentuItemsForFolderContentRClick();
        this.showContexMenu = true;
    }

    private isFolder(): boolean {
        let selected = this.getSelected();
        return selected.Type === folderContentType.folder;
    }

    enterFolder() {
        let selected = this.getSelected();
        this._currentPage = 1;
        this.updateFolderContent(selected.Name, selected.Path, 1);
    }

    dbClickEnterFolder(args: EnterFolderArgs) {
        this._currentPage = 1;
        this.updateFolderContent(args.Name, args.Path, 1);
    }

    onrightClick(event: IContexMenuCoordinates) {
        if (this.ignoreOnRightClick) {
            this.ignoreOnRightClick = false;
            return;
        }
        this.contexMenuX = event.pageX;
        this.contexMenuY = event.pageY;
        this.contexMenuItems = this.getContexMentuItemsForFolderContentContainerRClick();
        this.showContexMenu = true;
    }

    onAddFile() {
        this.needToShowUploadBox = true;
        console.log("onAddFile");
    }

    downloadFile() {
        let selected = this.getSelected();
        this.folderContentService.downloadFile(selected.Name, selected.Path);
    }

    getContexMentuItemsForFolderContentRClick(): IContexMentuItem[] {
        let deleteToEvent = new ContexMentuItem();
        deleteToEvent.onClick = this.onDeleteContexMenuClick.bind(this);
        deleteToEvent.name = "Delete";
        deleteToEvent.needToshow = () => true;
        deleteToEvent.showAllways = true;

        let renameToEvent = new ContexMentuItem();
        renameToEvent.onClick = this.onRenameContexMenuClick.bind(this);
        renameToEvent.name = "Rename";
        renameToEvent.needToshow = () => true;
        renameToEvent.showAllways = true;

        let copyToEvent = new ContexMentuItem();
        copyToEvent.onClick = this.onCoptyContexMenuClick.bind(this);
        copyToEvent.name = "Copy";
        copyToEvent.needToshow = () => true;
        copyToEvent.showAllways = true;

        let cutToEvent = new ContexMentuItem();
        cutToEvent.onClick = this.onCutContexMenuClick.bind(this);
        cutToEvent.name = "Cut";
        cutToEvent.needToshow = () => true;
        cutToEvent.showAllways = true;

        let pasteToEvent = new ContexMentuItem();
        pasteToEvent.onClick = this.onPasteContexMenuClick.bind(this);
        pasteToEvent.name = "Paste";
        pasteToEvent.needToshow = (() => { return (this.isFolder() && this.canPaste()); }).bind(this);
        pasteToEvent.showAllways = false;

        let enterToEvent = new ContexMentuItem();
        enterToEvent.onClick = this.enterFolder.bind(this);
        enterToEvent.name = "Enter";
        enterToEvent.needToshow = this.isFolder.bind(this);;
        enterToEvent.showAllways = false;

        let downloadToEvent = new ContexMentuItem();
        downloadToEvent.onClick = this.downloadFile.bind(this);
        downloadToEvent.name = "Download";
        downloadToEvent.needToshow = (() => { return (!this.isFolder()); }).bind(this);
        downloadToEvent.showAllways = false;


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

        let pasteToEvent = new ContexMentuItem();
        pasteToEvent.onClick = this.onPasteContexMenuClick.bind(this);
        pasteToEvent.name = "Paste";
        pasteToEvent.needToshow = this.canPaste.bind(this);
        pasteToEvent.showAllways = false;

        let addFileToEvent = new ContexMentuItem();
        addFileToEvent.onClick = this.onAddFile.bind(this);
        addFileToEvent.name = "Add File";
        addFileToEvent.needToshow = () => true;
        addFileToEvent.showAllways = true;

        return [createNewFolderToEvent,
            pasteToEvent,
            addFileToEvent];
    }

    canPaste(): boolean {
        let clipboardObj = this.clipboard.peekClipBoardObj();
        let selected = this.getSelected();
        return this.clipboard.popClipBoardOperation() !== null &&
            this.clipboard.popClipBoardOperation() !== undefined &&
            clipboardObj !== null &&
            clipboardObj !== undefined &&
            //Or we have selected or we do not have and we paste in the containing folder
            ((selected !== null &&
                selected !== undefined &&
                !clipboardObj.equals(selected))
                ||
                (selected === null ||
                    selected === undefined));
    }

    inputBoxOnCancel() {
        this.neddToShowInputBox = false;
    }

    uploadFileOnCancel() {
        this.needToShowUploadBox = false;
    }

    getCurrentPath(): string {
        if (this._listOfFileFolderNames == undefined) {
            return 'home/';
        }
        if (this._listOfFileFolderNames.Path === '') return this._listOfFileFolderNames.Name;
        return `${this._listOfFileFolderNames.Path}/${this._listOfFileFolderNames.Name}`;
    }

    onFinishAddFile() {
        this.updateThisFolderContentAfterOperation(this._currentPage);
    }

    onStartAddFile() {
        this.needToShowUploadBox = false;
    }

    updateThisFolderContentAfterOperation(pageNum: number) {
        this.updateFolderContent(this.folderContentService.getContaningFolderNameFromPath(this.getCurrentPath()),
            this.folderContentService.getContaningFolderPathFromPath(this.getCurrentPath()),
            pageNum);
    }

    inputBoxCreateNewFolder(folderName: string) {
        this.neddToShowInputBox = false;

        if (!this.validateNotEmptyStringAndShowMessageBox(folderName, "The folder name cannot be empty")) return;

        let resp = this.folderContentService.createFolder(folderName, this.getCurrentPath());
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(this._currentPage),
            error => {
                this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
            })
    }

    inputBoxRename(selected: IFolderContent): (input: string) => void {
        return (newName: string) => {
            this.neddToShowInputBox = false;
            if (!this.validateNotEmptyStringAndShowMessageBox(newName, "The new name cannot be empty")) return;

            if (selected.Type === folderContentType.file) {
                let fileExtentionIndex = selected.Name.lastIndexOf('.');
                let fileExtention = selected.Name.substring(fileExtentionIndex);
                newName = newName + fileExtention;
            }

            let resp = this.folderContentService.renameFolderContent(selected.Name, selected.Path, selected.Type, newName);
            resp.subscribe(
                data => this.updateThisFolderContentAfterOperation(this._currentPage),
                error => {
                    this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Rename");
                })
        }
    }

    validateNotEmptyStringAndShowMessageBox(str: string, errorMessage: string): boolean {
        if (str === "" || str === undefined) {
            this.showMessageBox(errorMessage, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
            return false;
        }

        return true;
    }

    onMessageBoxClick(action: (result: DialogResult) => void, cont: () => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (result: DialogResult) => {
            bindedAction(result);
            bindedCont();
        }
    }

    onInputBoxClick(action: (input: string) => void, cont: () => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (input: string) => {
            bindedAction(input);
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

    showInputBox(placeHolder: string, header: string, okBUttonName: string, onSubmit: (input: string) => void, onCancel: () => void, cont: () => void) {
        this.inputBoxPlaceHolder = placeHolder;
        this.inputBoxHeader = header;
        this.inputBoxOkButtonName = okBUttonName;
        this.inputBoxOnSubmitEvent = this.onInputBoxClick(onSubmit, cont);
        this.inputBoxOnCancel = onCancel.bind(this);
        this.neddToShowInputBox = true;
    }

    navBarOnPathBreakClick(fullPath: string) {
        let folderName = this.folderContentService.getContaningFolderNameFromPath(fullPath);
        let folderPath = this.folderContentService.getContaningFolderPathFromPath(fullPath);
        this._currentPage = 1;
        this.updateFolderContent(folderName, folderPath, 1);
    }

    onErrorUploadFile(error: string) {
        this.showMessageBox(`Error on upload file: ${error}`, MessageBoxType.Error, MessageBoxButton.Ok, "Upload File");
    }

    onPageChanged(pageNum: number) {
        this._currentPage = pageNum;
        this.updateThisFolderContentAfterOperation(pageNum);
    }

    onSelectionChanged(selectedProperties: ISelecableProperties){
        this.selectedProperties = selectedProperties;
    }

    registerSelectableGrid(selectableGrid: SelectableGrid){
        this._selectableGrid = selectableGrid;
    }

    getSelected(): IFolderContent{
        return this._selectableGrid.getSelected();
    }
}