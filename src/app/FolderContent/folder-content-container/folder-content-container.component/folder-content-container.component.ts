import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { FolderContentContainerControler } from "../folder-content-container-controler/folder-content-container-controler";
import { IFolderContentContainerView } from "../folder-content-container-controler/ifolder-content-container-view";
import { IFolder } from "../../Model/IFolder";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { sortType } from "../../Model/sortType";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { SelectableGrid } from "../../selectable-grid/selectalbe-grid.component/selectalbe-grid.component";
import { FolderContentNavBar } from "../../folder-content-nav-bar/folder-content-nav-bar";
import { ISelecableProperties } from "../../Model/ISelecableProperties";
import { IContexMenuCoordinates } from "../../../Common/multi-level-contex-menu/contex-menu.component/icontex-menu-coordinates";
import { IFolderContent } from "../../Model/IFolderContent";
import { IUploadArgs } from "../../upload-form.component/iupload-args";
import { FolderContentInputArgs } from "../../helper-classes/folder-content-input-box-args";
import { FolderContentMessageBoxArgs } from "../../helper-classes/folder-content-message-box-args";
import { ContexMenuType } from "../../helper-classes/contex-menu-type";
import { VideoArgs } from "../../helper-classes/video-args";
import { DoubleClickEventArgs } from "../../selectable-grid/selectalbe-grid.component/select-able.component/enterFolderArgs";
import { folderContentType } from "../../Model/folderContentType";


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
        private controler: FolderContentContainerControler, private router: Router, private el: ElementRef) {
        controler.initializeView(this)
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.controler.saveState();
            }
        });
    }

    @ViewChild('scrollArea', { read: ElementRef }) scrollAreaElement: ElementRef;

    dragOver: boolean;
    currentPath: string;
    listOfFileFolderNames: IFolder;
    currentPage: number;
    private ignoreDisableSelection: boolean;
    private ignoreOnRightClick: boolean;
    selectedProperties: ISelecableProperties = null;
    disableRefresh: boolean = false;
    private _folderContentNavBar: FolderContentNavBar;
    private _selectableGrid: SelectableGrid;
    needToShowUploadBox: boolean;
    uploadBoxCancel: () => void = this.uploadFileOnCancel;
    navBarPath: string;
    navBarPathBreakClick: (fullPath: string) => void = this.navBarOnPathBreakClick;
    numberOfElementsOnPage: number;
    numberOfElementsOnPageOptions: number[];
    currentSortType: sortType;
    loading: boolean;
    showContexMenu: boolean;
    contexMenuX: number;
    contexMenuY: number;
    needToShowInputBox: boolean;
    inputBoxHeader: string;
    inputBoxOkButtonName: string;
    inputBoxPlaceHolder: string;
    inputBoxOnCancelEvent: () => void;
    inputBoxOnSubmitEvent: (input: string) => void;
    messageBoxResult: DialogResult;
    needToShowMessageBox: boolean;
    messageBoxText: string;
    messageBoxCaption: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (result: DialogResult) => void;
    messageBoxOnButton2Click: (result: DialogResult) => void;
    contexMenuType: ContexMenuType;
    selectedFolderContentItem: IFolderContent;
    needToShowPopupVideo: boolean;
    videoUrl: string;

    ngOnInit(): void {
        if (!this.controler.canActive()) {
            this.router.navigate(['login']);
            return;
        }
        this.controler.restoreState();
        this.numberOfElementsOnPageOptions = this.getNumberOfelementOnPageOptions();
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
        this.contexMenuX = coordinates.pageX - window.pageXOffset;
        this.contexMenuY = coordinates.pageY - window.pageYOffset;
        this.contexMenuType = ContexMenuType.folderContentContexMenu;
        this.showContexMenu = true;
    }

    selectableDoubleClickEvent(args: DoubleClickEventArgs) {
        if(args.type === folderContentType.folder){
            this.dbClickEnterFolder(args);
        }
        if(args.type === folderContentType.file){
            this.dbClickOpenFile(args);
        }
    }

    dbClickEnterFolder(args: DoubleClickEventArgs) {
        this.clearNavBarSearchText();
        if(args === null || args === undefined) return;
        this.controler.updateFolderContent(args.Name, args.Path, 1);
    }

    dbClickOpenFile(args: DoubleClickEventArgs){
        if(args === null || args === undefined || !this.controler.canOpenFile(args.Name, args.type)) return;
        this.controler.openFile(args.Name, args.Path);
    }

    onrightClick(event: IContexMenuCoordinates) {
        if (this.ignoreOnRightClick) {
            this.ignoreOnRightClick = false;
            return;
        }

        if (this.controler.isSearchResult()) return;
        this.disableSelection();
        this.contexMenuX = event.pageX - window.pageXOffset;
        this.contexMenuY = event.pageY - window.pageYOffset;
        this.contexMenuType = ContexMenuType.emptySpaceClickContexMenu;
        this.showContexMenu = true;
    }

    clearNavBarSearchText(){
        this._folderContentNavBar.clearSearchText();
    }

    inputBoxOnCancel() {
        this.needToShowInputBox = false;
    }

    uploadFileOnCancel() {
        this.changeShowUploadBox(false);
    }

    onStartAddFile() {
        this.changeShowUploadBox(false);
    }

    onMessageBoxClick(action: (result: DialogResult) => void, cont: (result: DialogResult) => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (result: DialogResult) => {
            bindedAction(result);
            bindedCont(result);
        }
    }

    onInputBoxClick(action: (input: string) => void, cont: (input: string) => void) {
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (input: string) => {
            bindedAction(input);
            bindedCont(input);
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

    showMessageBox(args: FolderContentMessageBoxArgs){
        this.internalShowMessageBox(args.message, args.type, args.buttons, args.caption, args.cont);
    }

    internalShowMessageBox(message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont: (result: DialogResult) => void) {

        this.messageBoxOnButton1Click = this.onMessageBoxClick(this.onMessageBoxOk, cont).bind(this);
        this.messageBoxOnButton2Click = this.onMessageBoxClick(this.onMessageBoxCancel, cont).bind(this);
        this.messageBoxMessageType = type;
        this.messageBoxText = message;
        this.messageBoxButtons = buttons;
        this, this.messageBoxCaption = caption;
        this.needToShowMessageBox = true;
    }

    showInputBox(args: FolderContentInputArgs){
        this.internalShowInputBox(args.placeHolder, args.header, args.okBUttonName, args.onSubmit, args.onCancel, args.cont);
    }

    private internalShowInputBox(placeHolder: string, header: string, okBUttonName: string, onSubmit: (input: string) => void, onCancel: () => void, cont: (input: string) => void) {
        this.inputBoxPlaceHolder = placeHolder;
        this.inputBoxHeader = header;
        this.inputBoxOkButtonName = okBUttonName;
        this.inputBoxOnSubmitEvent = this.onInputBoxClick(onSubmit, cont);
        this.inputBoxOnCancel = onCancel.bind(this);
        this.needToShowInputBox = true;
    }

    navBarOnPathBreakClick(fullPath: string) {
        this.controler.goToPath(fullPath);
    }

    onErrorUploadFile(error: string) {
        this.internalShowMessageBox(`Error on upload file: ${error}`, MessageBoxType.Error, MessageBoxButton.Ok, "Upload File", ()=>{});
    }

    onPageChanged(pageNum: number) {
        this.currentPage = pageNum;
        this.controler.updateThisFolderContentAfterOperation(pageNum);
    }

    onSelectionChanged(selectedProperties: ISelecableProperties) {
        this.hideContexMenu();
        this.selectedFolderContentItem =  this.getSelected()
        this.selectedProperties = selectedProperties;
    }

    registerSelectableGrid(selectableGrid: SelectableGrid) {
        this._selectableGrid = selectableGrid;
    }

    registerFolderContentNavBar(folderContentNavBar: FolderContentNavBar) {
        this._folderContentNavBar = folderContentNavBar;
    }

    getSelected(): IFolderContent {
        if(this._selectableGrid === null || this._selectableGrid === undefined) return null;
        return this._selectableGrid.getSelected();
    }

    onSubmitUpload(uploadArgs: IUploadArgs) {
        this.controler.addFile(uploadArgs, this.onErrorUploadFile.bind(this));
        this.onStartAddFile();
    }

    onSearchClick(nameToSearch: string) {
        this.controler.search(nameToSearch, 1);
    }

    onSearchClear() {
        this.controler.updateFolderContent('home', '', 1);
    }

    getNumberOfelementOnPageOptions(): number[] {
        if (this.controler.isSearchResult()) {
            return [20];
        }
        return [20, 50, 100, 200];
    }

    onNumberOfElementsOnPageChange(numElementOnPage) {
        this.currentPage = 1;
        this.controler.updateCurrentFolderMetadata(this.currentSortType, numElementOnPage)
    }

    updateNumberOfElementsOnPageOptions() {
        this.numberOfElementsOnPageOptions = this.getNumberOfelementOnPageOptions();
    }

    updateRefreshButtonState() {
        if (this.controler.isSearchResult()) {
            this.disableRefresh = true;
        }
        else {
            this.disableRefresh = false;
        }
    }

    onDrop() {
        this.dragOver = false;
    }

    onDrag(event) {
        var rect = this.scrollAreaElement.nativeElement.getBoundingClientRect();
        // Check the mouseEvent coordinates are outside of the rectangle
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
                this.dragOver = true;
        }
        else {
            this.dragOver = false;
        }
    }

    onErrorDragAndDrop(message: string){
        this.showMessage(message, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Drag and drop", ()=>{});
    }

    changeShowUploadBox(show: boolean){
        this.needToShowUploadBox = show;
    }

    changeShowInputBox(show: boolean){
        this.needToShowInputBox = show;
    }

    showLoadingLayer(show: boolean){
        this.loading = show;
    }

    showMessage( message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont: () => void) {
        this.internalShowMessageBox(message, type, buttons, caption, cont);
    }

    updateViewOnOperation(){
        this.controler.updateFolderContentWithCurrentPage();
    }

    changeNeedToShowVideo(show: boolean){
        this.needToShowPopupVideo = show;
    }

    showVideo(videoArgs: VideoArgs){
        this.videoUrl = videoArgs.videoUrl;
        this.needToShowPopupVideo = videoArgs.showPopupVideo;
    }

    onCloseVideo(){
        console.log("hello");
        this.needToShowPopupVideo = false;
    }
}