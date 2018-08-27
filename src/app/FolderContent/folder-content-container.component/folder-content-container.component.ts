import { Component, Input, OnInit } from "@angular/core";
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
import { retry } from "rxjs/operators";
import { EnterFolderArgs } from "../select-able.component/enterFolderArgs";

@Component({
    selector: "folder-content-container",
    templateUrl: "./folder-content-container.component.html",
    styleUrls: ['./folder-content-container.component.css']

})
export class FolderContentContainter implements OnInit {

    constructor(private folderContentService: FolderContnentService) {
    }

    private listOfFileFoldersObj: SelectableComponent[] = new Array<SelectableComponent>();
    private ignoreDisableSelection: boolean;
    private ignoreOnRightClick: boolean;
    private listOfListsOfNames: IFolderContent[][] = [];
    private contexMenuX: number;
    private contexMenuY: number;
    private _listOfFileFolderNames: IFolder;
    private contexMenuItems: IContexMentuItem[];

    showContexMenu: boolean;
    showInputBox: boolean;

    //message box
    needToShowMessageBox: boolean;
    messageBoxText: string;
    messageBoxMessageType: MessageBoxType;
    messageBoxButtons: MessageBoxButton;
    messageBoxOnButton1Click: (str: string) => void;
    messageBoxOnButton2Click: (str: string) => void;

    public get listOfFileFolderNames(): IFolder {
        return this._listOfFileFolderNames;
    }
    @Input()
    public set listOfFileFolderNames(value: IFolder) {
        this._listOfFileFolderNames = value;
        this.InitializeListOfListsOfNames();
    }
    @Input() maxColumns: number = 4;

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
            folder => this.listOfFileFolderNames = folder,
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
        if (selected.Type === folderContentType.folder) {
            this.folderContentService.deleteFolder(selected.Name, selected.Path).subscribe(
                data => this.updateThisFolderContentAfterOperation(),
                error => this.messageBoxText = <any>error
            );
        }
        this.InitializeListOfListsOfNames();
    }

    onCoptyContexMenuClick() {
        console.log("Copy");
    }

    onCutContexMenuClick() {
        console.log("Cut");
    }

    onPasteContexMenuClick() {
        console.log("Paste");
    }

    onCreateNewFolderContexMenuClick() {
        this.showInputBox = true;
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

    dbClickEnterFolder(args : EnterFolderArgs){
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

    getContexMentuItemsForFolderContentRClick(): IContexMentuItem[] {
        let deleteToEvent = new ContexMentuItem();
        deleteToEvent.onClick = this.onDeleteContexMenuClick.bind(this);
        deleteToEvent.name = "Delete";
        deleteToEvent.needToshow = () => true;
        deleteToEvent.showAllways = true;

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
        pasteToEvent.needToshow = this.isFolder.bind(this);
        pasteToEvent.showAllways = false;

        let enterToEvent = new ContexMentuItem();
        enterToEvent.onClick = this.enterFolder.bind(this);
        enterToEvent.name = "Enter";
        enterToEvent.needToshow = this.isFolder.bind(this);
        enterToEvent.showAllways = false;

        return [deleteToEvent,
            copyToEvent,
            cutToEvent,
            pasteToEvent,
            enterToEvent];
    }

    getContexMentuItemsForFolderContentContainerRClick(): IContexMentuItem[] {
        let createNewFolderToEvent = new ContexMentuItem();
        createNewFolderToEvent.onClick = this.onCreateNewFolderContexMenuClick.bind(this);
        createNewFolderToEvent.name = "Create New Folder";
        createNewFolderToEvent.needToshow = () => true;
        createNewFolderToEvent.showAllways = true;
        return [createNewFolderToEvent];
    }

    inputBoxOnCancel() {
        this.showInputBox = false;
    }

    getCurrentPath(): string {
        if (this.listOfFileFolderNames == undefined) {
            return 'home/';
        }
        if (this.listOfFileFolderNames.Path === '') return this.listOfFileFolderNames.Name;
        return `${this.listOfFileFolderNames.Path}/${this.listOfFileFolderNames.Name}`;
    }

    updateThisFolderContentAfterOperation() {
        this.updateFolderContent(this.folderContentService.getContaningFolderNameFromPath(this.getCurrentPath()),
            this.folderContentService.getContaningFolderPathFromPath(this.getCurrentPath()));
    }

    inputBoxCreateNewFolder(folderName: string) {
        this.showInputBox = false;

        if(!this.validateNotEmptyStringAndShowMessageBox(folderName,"The folder name cannot be empty")) return;

        let resp = this.folderContentService.createFolder(folderName, this.getCurrentPath());
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(),
            error => this.messageBoxText = <any>error)
    }

    validateNotEmptyStringAndShowMessageBox(str: string, errorMessage: string) : boolean{
        if(str === "" || str === undefined){
            this.showMessageBox(errorMessage, MessageBoxType.Error, MessageBoxButton.Ok);
            return false;
        }

        return true;
    }
    
    onMessageBoxCancel(input: string){
        this.needToShowMessageBox = false;
    }

    onMessageBoxOk(input: string){
        this.needToShowMessageBox = false;
    }

    showMessageBox(message: string, type: MessageBoxType, buttons: MessageBoxButton) {

        this.messageBoxOnButton1Click = this.onMessageBoxOk;
        this.messageBoxOnButton2Click = this.onMessageBoxCancel;
        this.messageBoxMessageType = type;
        this.messageBoxText = message;
        this.messageBoxButtons = buttons;
        this.showInputBox = false;
        this.needToShowMessageBox = true;
    }
}