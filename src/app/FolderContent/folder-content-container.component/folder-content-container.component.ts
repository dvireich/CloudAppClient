import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
import { SelectableComponent } from "../select-able.component/select-able.component";
import { IContexMenuCoordinates } from "../../Common/contexMenu.component/IContexMenuCoordinates";
import { IFolderContent } from "../IFolderContent";

import { IFolder } from "../IFolder";
import { FileObj } from "../FileObj";
import { FolderObj } from "../FolderObj";
import { FolderContnentService } from "../FolderContentService/folder-content-service";
import { folderContentType } from "../folderContentType";
import { IContexMentuItem } from "../../Common/contexMenu.component/IContexMentuItem";
import { ContexMentuItem } from "../../Common/contexMenu.component/contexMentuItem";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { EnterFolderArgs } from "../select-able.component/enterFolderArgs";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { FolderContentClipBoard } from "../folder-content-clipboard";
import { ClipBoardOperation } from "../clipBoardOperation";
import { IPathBreak } from "../../Common/navBar.component/IPathBreak";
import { PathBreak } from "../../Common/navBar.component/pathBreak";

@Component({
    selector: "folder-content-container",
    templateUrl: "./folder-content-container.component.html",
    styleUrls: ['./folder-content-container.component.css']

})
export class FolderContentContainter implements OnInit {

    constructor(private folderContentService: FolderContnentService,
        private clipboard: FolderContentClipBoard) {
            folderContentService.subscriberToFinishUploadToAction(this, this.updateThisFolderContentAfterOperation.bind(this))
    }

    private listOfFileFoldersObj: SelectableComponent[] = new Array<SelectableComponent>();
    private ignoreDisableSelection: boolean;
    private ignoreOnRightClick: boolean;
    private listOfListsOfNames: IFolderContent[][] = [];
    private _listOfFileFolderNames: IFolder;

    //UploadBox
    needToShowUploadBox: boolean;
    uploadBoxCancel: () => void = this.uploadFileOnCancel;

    //NavBar
    navBarPathBreaks: IPathBreak[];
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

    public get listOfFileFolderNames(): IFolder {
        return this._listOfFileFolderNames;
    }
    @Input()
    public set listOfFileFolderNames(value: IFolder) {
        this._listOfFileFolderNames = value;
        this.InitializeListOfListsOfNames();
    }
    @Input() maxColumns: number = 25;

    ngOnInit(): void {
        if (this._listOfFileFolderNames == undefined) {
            this.updateFolderContent('"home"', '""');
        }
        else {
            this.InitializeListOfListsOfNames();
        }
    }

    private updateFolderContent(folderName: string, folderPath: string): void {
        this.folderContentService.getFolder(folderName, folderPath).subscribe(
            folder => {
                this.listOfFileFolderNames = folder;
                this.navBarPathBreaks = this.breakPathIntoPathBreaks(this.getCurrentPath());
            },
            error => this.messageBoxText = <any>error);
    }

    private InitializeListOfListsOfNames() {
        this.listOfListsOfNames = [];
        for (let i: number = 0; i < this.listOfFileFolderNames.Content.length; i = i + this.maxColumns) {
            let tmpArray: IFolderContent[] = new Array<IFolderContent>();
            for (let j: number = 0; j < this.maxColumns && i + j < this.listOfFileFolderNames.Content.length; j++) {
                tmpArray.push(this.listOfFileFolderNames.Content[i + j])
            }
            this.listOfListsOfNames.push(tmpArray);
        }
    }

    private getSelected(): IFolderContent {
        let selectedNames = this.listOfFileFoldersObj.filter(element => element.isSeletcted());
        if (selectedNames.length > 1) {
            selectedNames.forEach(element => console.log(element.text + " is selected!"));
            throw new Error('There is more than 1 selected items! This is not allowed');
        }
        if (selectedNames.length === 0) return null;

        let folderContentObject: IFolderContent;
        if (selectedNames[0].type === folderContentType.file) {
            folderContentObject = new FileObj();
        }
        if (selectedNames[0].type === folderContentType.folder) {
            folderContentObject = new FolderObj();
        }
        folderContentObject.Name = selectedNames[0].text;
        folderContentObject.Path = selectedNames[0].path;
        return folderContentObject;
    }

    onDeleteContexMenuClick() {
        let selected = this.getSelected();
        this.showMessageBox("Are you sure you want delete?", MessageBoxType.Question, MessageBoxButton.YesNo, "Delete", () => {
            if (this.messageBoxResult === DialogResult.No) return;
            if (selected.Type === folderContentType.folder) {
                this.folderContentService.deleteFolder(selected.Name, selected.Path).subscribe(
                    data => this.updateThisFolderContentAfterOperation(),
                    error => this.messageBoxText = <any>error
                );
            }
            if (selected.Type === folderContentType.file) {
                this.folderContentService.deleteFile(selected.Name, selected.Path).subscribe(
                    data => this.updateThisFolderContentAfterOperation(),
                    error => this.messageBoxText = <any>error
                );
            }
            this.InitializeListOfListsOfNames();
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
        if (this.listOfFileFolderNames == undefined) {
            result.Name = 'home';
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else if (this.listOfFileFolderNames.Path === '') {
            result.Name = this.listOfFileFolderNames.Name;
            result.Path = '';
            result.Content = new Array<IFolderContent>();
        }
        else {
            result.Name = this.listOfFileFolderNames.Name;
            result.Path = this.listOfFileFolderNames.Path;
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
                    let respOfDelete = this.folderContentService.deleteFolder(objTocopy.Name, objTocopy.Path);
                    respOfDelete.subscribe(data => this.updateThisFolderContentAfterOperation(),
                        error => {
                            this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
                        });
                }
                else {
                    this.updateThisFolderContentAfterOperation();
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

    addChildComponent(child: SelectableComponent) {
        this.listOfFileFoldersObj.push(child);
    }

    unSelectAllChilds() {
        this.hideContexMenu();
        this.listOfFileFoldersObj.forEach(element => {
            element.unSelect();
        });
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
        this.unSelectAllChilds();
        this.hideContexMenu();
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
        this.updateFolderContent(selected.Name, selected.Path);
    }

    dbClickEnterFolder(args: EnterFolderArgs) {
        this.updateFolderContent(args.Name, args.Path);
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

    downloadFile(){
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
            !clipboardObj.equals(selected);
    }

    inputBoxOnCancel() {
        this.neddToShowInputBox = false;
    }

    uploadFileOnCancel() {
        this.needToShowUploadBox = false;
    }

    getCurrentPath(): string {
        if (this.listOfFileFolderNames == undefined) {
            return 'home/';
        }
        if (this.listOfFileFolderNames.Path === '') return this.listOfFileFolderNames.Name;
        return `${this.listOfFileFolderNames.Path}/${this.listOfFileFolderNames.Name}`;
    }

    onFinishAddFile() {
        this.updateThisFolderContentAfterOperation();
    }

    onStartAddFile() {
        this.needToShowUploadBox = false;
    }

    updateThisFolderContentAfterOperation() {
        this.updateFolderContent(this.folderContentService.getContaningFolderNameFromPath(this.getCurrentPath()),
            this.folderContentService.getContaningFolderPathFromPath(this.getCurrentPath()));
    }

    inputBoxCreateNewFolder(folderName: string) {
        this.neddToShowInputBox = false;

        if (!this.validateNotEmptyStringAndShowMessageBox(folderName, "The folder name cannot be empty")) return;

        let resp = this.folderContentService.createFolder(folderName, this.getCurrentPath());
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(),
            error => {
                this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
            })
    }

    inputBoxRename(selected: IFolderContent): (input: string) => void {
        return (newName: string) => {
            this.neddToShowInputBox = false;
            if (!this.validateNotEmptyStringAndShowMessageBox(newName, "The new name cannot be empty")) return;

            let resp = this.folderContentService.renameFolderContent(selected.Name, selected.Path, selected.Type, newName);
            resp.subscribe(
                data => this.updateThisFolderContentAfterOperation(),
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

    breakPathIntoPathBreaks(path: string): IPathBreak[] {
        let splittedPath = path.split('/');
        let result: IPathBreak[] = new Array<IPathBreak>();

        for (let i: number = 0; i < splittedPath.length; i++) {
            let pathBreak = splittedPath[i];

            let fullPathBreaks = splittedPath.slice(0, i);
            let fullPath = fullPathBreaks.reduce((prev, currVal) => prev + '/' + currVal, "");

            result.push(new PathBreak(pathBreak, fullPath));
        }
        return result;
    }

    navBarOnPathBreakClick(fullPath: string) {
        let folderName = this.folderContentService.getContaningFolderNameFromPath(fullPath);
        let folderPath = this.folderContentService.getContaningFolderPathFromPath(fullPath);
        this.updateFolderContent(folderName, folderPath);
    }

    onErrorUploadFile(error: string){
        this.showMessageBox(`Error on upload file: ${error}`, MessageBoxType.Error, MessageBoxButton.Ok, "Upload File");
    }
}