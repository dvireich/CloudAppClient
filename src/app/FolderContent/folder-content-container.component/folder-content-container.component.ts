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
import { EnterFolderArgs } from "../select-able.component/enterFolderArgs";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";

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
        this.showMessageBox("Are you sure you want delete?", MessageBoxType.Question, MessageBoxButton.YesNo, "Delete", ()=>{
            if(this.messageBoxResult === DialogResult.No) return;
            if (selected.Type === folderContentType.folder) {
                this.folderContentService.deleteFolder(selected.Name, selected.Path).subscribe(
                    data => this.updateThisFolderContentAfterOperation(),
                    error => this.messageBoxText = <any>error
                );
            }
            this.InitializeListOfListsOfNames();
        });  
    }

    onRenameContexMenuClick(){
        this.showInputBox("Enter the new name...","Rename", "Rename", this.inputBoxRename(this.getSelected()), this.inputBoxOnCancel, ()=>{});
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
        this.showInputBox("Enter folder name...","Create Folder", "Create", this.inputBoxCreateNewFolder, this.inputBoxOnCancel,()=>{});
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
        pasteToEvent.needToshow = this.isFolder.bind(this);
        pasteToEvent.showAllways = false;

        let enterToEvent = new ContexMentuItem();
        enterToEvent.onClick = this.enterFolder.bind(this);
        enterToEvent.name = "Enter";
        enterToEvent.needToshow = this.isFolder.bind(this);
        enterToEvent.showAllways = false;

        return [deleteToEvent,
            copyToEvent,
            renameToEvent,
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
        this.neddToShowInputBox = false;
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
        this.neddToShowInputBox = false;

        if(!this.validateNotEmptyStringAndShowMessageBox(folderName,"The folder name cannot be empty")) return;

        let resp = this.folderContentService.createFolder(folderName, this.getCurrentPath());
        resp.subscribe(
            data => this.updateThisFolderContentAfterOperation(),
            error => 
            {
                this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder" );
            })
    }

    inputBoxRename(selected : IFolderContent) : (input: string)=> void{
        return (newName: string)=>{
            this.neddToShowInputBox = false;
            console.log("inputBoxRename: selected: " + selected);
            if(!this.validateNotEmptyStringAndShowMessageBox(newName,"The new name cannot be empty")) return;
    
            let resp = this.folderContentService.renameFolderContent(selected.Name, selected.Path, newName);
            resp.subscribe(
                data => this.updateThisFolderContentAfterOperation(),
                error => 
                {
                    this.showMessageBox(<any>error, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Rename" );
                })
        }
    }

    validateNotEmptyStringAndShowMessageBox(str: string, errorMessage: string) : boolean{
        if(str === "" || str === undefined){
            this.showMessageBox(errorMessage, MessageBoxType.Error, MessageBoxButton.Ok, "Error: Create new folder");
            return false;
        }

        return true;
    }

    onMessageBoxClick(action: (result: DialogResult)=> void, cont : ()=> void){
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (result: DialogResult) =>{
            bindedAction(result);
            bindedCont();
        }
    }

    onInputBoxClick(action: (input : string) => void, cont: ()=> void){
        let bindedAction = action.bind(this);
        let bindedCont = cont.bind(this);
        return (input : string) =>{
            bindedAction(input);
            bindedCont();
        }
    }
    
    onMessageBoxCancel(result: DialogResult){
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    onMessageBoxOk(result: DialogResult){
        this.messageBoxResult = result;
        this.needToShowMessageBox = false;
    }

    showMessageBox(message: string, type: MessageBoxType, buttons: MessageBoxButton, caption: string, cont : ()=> void = ()=>{}) {

        this.messageBoxOnButton1Click = this.onMessageBoxClick(this.onMessageBoxOk, cont).bind(this);
        this.messageBoxOnButton2Click = this.onMessageBoxClick(this.onMessageBoxCancel, cont).bind(this);
        this.messageBoxMessageType = type;
        this.messageBoxText = message;
        this.messageBoxButtons = buttons;
        this,this.messageBoxCaption = caption;
        this.needToShowMessageBox = true;
    }

    showInputBox(placeHolder: string ,header: string, okBUttonName: string, onSubmit: (input: string)=> void, onCancel: ()=>void, cont: ()=> void){
        this.inputBoxPlaceHolder = placeHolder;
        this.inputBoxHeader = header;
        this.inputBoxOkButtonName = okBUttonName;
        this.inputBoxOnSubmitEvent = this.onInputBoxClick(onSubmit, cont);
        this.inputBoxOnCancel = onCancel.bind(this);
        this.neddToShowInputBox = true;
    }
}