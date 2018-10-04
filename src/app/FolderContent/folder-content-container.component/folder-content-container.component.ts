import { Component, OnInit, HostListener } from "@angular/core";
import { IFolderContent } from "../Model/IFolderContent";
import { folderContentType } from "../Model/folderContentType";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { NavigationStart, Router } from "@angular/router";
import { SelectableGrid } from "../selectable-grid/selectalbe-grid.component/selectalbe-grid.component";
import { EnterFolderArgs } from "../selectable-grid/selectalbe-grid.component/select-able.component/enterFolderArgs";
import { IContexMentuItem } from "../../Common/contex-menu.component/icontex-mentu-item";
import { ContexMentuItem } from "../../Common/contex-menu.component/contex-mentu-item";
import { IUploadArgs } from "../upload-form.component/iupload-args";
import { FolderContentContainerControler } from "../folder-content-container-controler/folder-content-container-controler";
import { IFolderContentContainerView } from "../folder-content-container-controler/ifolder-content-container-view";
import { IFolder } from "../Model/IFolder";
import { IContexMenuCoordinates } from "../../Common/contex-menu.component/icontex-menu-coordinates";
import { ISelecableProperties } from "../Model/ISelecableProperties";
import { FolderContentNavBar } from "../folder-content-nav-bar/folder-content-nav-bar";

@Component({
    selector: "folder-content-container",
    templateUrl: "./folder-content-container.component.html",
    styleUrls: ['./folder-content-container.component.css']
})
export class FolderContentContainter implements IFolderContentContainerView, OnInit {
    canDeactivate(): boolean {
        return confirm("Are you sure you want to leave?. If you will press ok you will be logout.")
    }
    
    constructor(
        private controler: FolderContentContainerControler, private router: Router) {
        controler.initializeView(this)
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.controler.saveState();
            }
        });
    }

    //IFolderContentContainerView implementaion
    private _listOfFileFolderNames: IFolder;

    public get listOfFileFolderNames(): IFolder {
        return this._listOfFileFolderNames;
    }

    public set listOfFileFolderNames(value: IFolder) {
        this._listOfFileFolderNames = value;
    }

    private _currentPage: number;

    public get currentPage(): number {
        return this._currentPage;
    }

    public set currentPage(value: number) {
        this._currentPage = value;
    }

    showMessage(
        message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void) {
        this.showMessageBox(message, type, buttons, caption, cont);
    }


    private ignoreDisableSelection: boolean;
    private ignoreOnRightClick: boolean;
    selectedProperties: ISelecableProperties = null;
    
    //folder-content-nav-bar
    private _folderContentNavBar: FolderContentNavBar;

    //selectable-grid
    private _selectableGrid: SelectableGrid;

    //UploadBox
    needToShowUploadBox: boolean;
    uploadBoxCancel: () => void = this.uploadFileOnCancel;

    //NavBar
    private _navBarPath: string;

    public get navBarPath(): string {
        return this._navBarPath;
    }

    public set navBarPath(value: string) {
        this._navBarPath = value;
    }
    navBarPathBreakClick: (fullPath: string) => void = this.navBarOnPathBreakClick;

    //loader
    private _loading: boolean;
    public set loading(value: boolean) {
        this._loading = value;
    }
    public get loading(): boolean {
        return this._loading;
    }
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
    private _messageBoxResult: DialogResult;

    public get messageBoxResult(): DialogResult {
        return this._messageBoxResult;
    }

    public set messageBoxResult(value: DialogResult) {
        this._messageBoxResult = value;
    }
    needToShowMessageBox: boolean;
    private _messageBoxText: string;

    public get messageBoxText(): string {
        return this._messageBoxText;
    }

    public set messageBoxText(value: string) {
        this._messageBoxText = value;
    }
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;

    ngOnInit(): void {
        if(!this.controler.canActive()){
            this.router.navigate(['login']);
            return;
        }
        window.onbeforeunload = ()=>{
            this.controler.logout();
        }
        this.controler.restoreState();
    }

    onDeleteContexMenuClick() {
        let selected = this.getSelected();
        this.controler.deleteFolderContent(selected);
    }

    onRenameContexMenuClick() {
        this.showInputBox("Enter the new name...", "Rename", "Rename", this.inputBoxRename(this.getSelected()), this.inputBoxOnCancel, () => { });
    }

    onCopyContexMenuClick() {
        let selected = this.getSelected();
        this.controler.copy(selected);
    }

    onCutContexMenuClick() {
        let selected = this.getSelected();
        this.controler.cut(selected);
    }

    onPasteContexMenuClick() {
        let copyTo = this.getSelected();
        this.controler.paste(copyTo);
    }

    onCreateNewFolderContexMenuClick() {
        this.showInputBox("Enter folder name...", "Create Folder", "Create", this.inputBoxCreateNewFolder, this.inputBoxOnCancel, () => { });
    }

    clearSelectbleGridSelection() {
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
        if(selected === null || selected === undefined) return false;
        
        return selected.Type === folderContentType.folder;
    }

    enterFolder() {
        let selected = this.getSelected();
        this._folderContentNavBar.clearSearchText();
        this.controler.updateFolderContent(selected.Name, selected.Path, 1);
    }

    dbClickEnterFolder(args: EnterFolderArgs) {
        this._folderContentNavBar.clearSearchText();
        this.controler.updateFolderContent(args.Name, args.Path, 1);
    }

    onrightClick(event: IContexMenuCoordinates) {
        if (this.ignoreOnRightClick) {
            this.ignoreOnRightClick = false;
            return;
        }

        if(this.controler.isSearchResult()) return;
        
        this.contexMenuX = event.pageX;
        this.contexMenuY = event.pageY;
        this.contexMenuItems = this.getContexMentuItemsForFolderContentContainerRClick();
        this.showContexMenu = true;
    }

    onAddFile() {
        this.needToShowUploadBox = true;
    }

    onDownloadFileClick() {
        let selected = this.getSelected();
        this.controler.downloadFile(selected);
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
        copyToEvent.onClick = this.onCopyContexMenuClick.bind(this);
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
        downloadToEvent.onClick = this.onDownloadFileClick.bind(this);
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
        let selected = this.getSelected();
        return this.controler.canPaste(selected);
    }

    inputBoxOnCancel() {
        this.neddToShowInputBox = false;
    }

    uploadFileOnCancel() {
        this.needToShowUploadBox = false;
    }

    onStartAddFile() {
        this.needToShowUploadBox = false;
    }

    inputBoxCreateNewFolder(folderName: string) {
        this.neddToShowInputBox = false;

        if (!this.validateNotEmptyStringAndShowMessageBox(folderName, "The folder name cannot be empty")) return;
        this.controler.createFolder(folderName);
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
            this.controler.rename(selected, newName);
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
        this.controler.goToPath(fullPath);
    }

    onErrorUploadFile(error: string) {
        this.showMessageBox(`Error on upload file: ${error}`, MessageBoxType.Error, MessageBoxButton.Ok, "Upload File");
    }

    onPageChanged(pageNum: number) {
        this._currentPage = pageNum;
        this.controler.updateThisFolderContentAfterOperation(pageNum);
    }

    onSelectionChanged(selectedProperties: ISelecableProperties) {
        this.hideContexMenu();
        this.selectedProperties = selectedProperties;
    }

    registerSelectableGrid(selectableGrid: SelectableGrid) {
        this._selectableGrid = selectableGrid;
    }

    registerFolderContentNavBar(folderContentNavBar: FolderContentNavBar) {
        this._folderContentNavBar = folderContentNavBar;
    }

    getSelected(): IFolderContent {
        return this._selectableGrid.getSelected();
    }

    onSubmitUpload(uploadArgs: IUploadArgs) {
        this.controler.addFile(uploadArgs, this.onErrorUploadFile.bind(this));
        this.onStartAddFile();
    }

    onSearchClick(nameToSearch: string){
        this.controler.search(nameToSearch, 1);
    }

    onSearchClear(){
        this.controler.updateFolderContent('home', '', 1);
    }
}