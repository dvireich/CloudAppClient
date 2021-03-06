import { Component, Input, OnInit, AfterViewInit, EventEmitter, Output } from "@angular/core";
import { IFolderContent } from "../../Model/IFolderContent";
import { SelectableComponent } from "./select-able.component/select-able.component";
import { IFolder } from "../../Model/IFolder";
import { ISelecableProperties } from "../../Model/ISelecableProperties";
import { FolderObj } from "../../Model/FolderObj";
import { folderContentType } from "../../Model/folderContentType";
import { FileObj } from "../../Model/FileObj";
import { IContexMenuCoordinates } from "../../../Common/multi-level-contex-menu/contex-menu.component/icontex-menu-coordinates";
import { DoubleClickEventArgs } from "./select-able.component/enterFolderArgs";


@Component({
    selector: 'selectable-grid',
    templateUrl: './selectalbe-grid.component.html'
})
export class SelectableGrid implements AfterViewInit {
    ngAfterViewInit(): void {
        this.RegisterInParent.emit(this);
    }

    listOfListsOfNames: IFolderContent[][] = [];
    private _listOfFileFolderNames: IFolder;
    private _listOfFileFoldersObj: SelectableComponent[] = new Array<SelectableComponent>();



    @Input() public set listOfFileFolderNames(value: IFolder) {
        this._listOfFileFolderNames = value;
        this.InitializeListOfListsOfNames();
    }
    @Input() maxColumns: number = 15;
    @Output() RegisterInParent: EventEmitter<SelectableGrid> = new EventEmitter<SelectableGrid>();
    @Output() SelectionChanged: EventEmitter<ISelecableProperties> = new EventEmitter<ISelecableProperties>();
    @Output() ApplyIgnoreDisableSelection: EventEmitter<void> = new EventEmitter<void>();
    @Output() ApplyParentIgnoreOnRightClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() ShowContexMenu: EventEmitter<IContexMenuCoordinates> = new EventEmitter<IContexMenuCoordinates>();
    @Output() DoubleClick: EventEmitter<DoubleClickEventArgs> = new EventEmitter<DoubleClickEventArgs>();


    private InitializeListOfListsOfNames() {
        this.listOfListsOfNames = [];
        for (let i: number = 0; this._listOfFileFolderNames !== null &&
            this._listOfFileFolderNames !== undefined &&
            i < this._listOfFileFolderNames.CurrentContentPage.length; i = i + this.maxColumns) {
            let tmpArray: IFolderContent[] = new Array<IFolderContent>();
            for (let j: number = 0; j < this.maxColumns && i + j < this._listOfFileFolderNames.CurrentContentPage.length; j++) {
                tmpArray.push(this._listOfFileFolderNames.CurrentContentPage[i + j])
            }
            this.listOfListsOfNames.push(tmpArray);
        }
        this.onSelectionChanged(null);
    }

    private addChildComponent(child: SelectableComponent) {
        this._listOfFileFoldersObj.push(child);
    }

    public getSelected(): IFolderContent {
        let selectedNames = this._listOfFileFoldersObj.filter(element => element.isSeletcted());
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
        folderContentObject.RelativePath = selectedNames[0].path;
        return folderContentObject;
    }

    clearSelection() {
        this._listOfFileFoldersObj.forEach(element => {
            element.unSelect();
        });
    }

    onSelectionChanged(selecableProperties: ISelecableProperties) {
        this.SelectionChanged.emit(selecableProperties);
    }

    onApplyIgnoreDisableSelection() {
        this.ApplyIgnoreDisableSelection.emit();
    }

    onSetIgnoreOnRightClick() {
        this.ApplyParentIgnoreOnRightClick.emit();
    }

    onShowContexMenu(contexMenuCoordinates: IContexMenuCoordinates) {
        this.ShowContexMenu.emit(contexMenuCoordinates);
    }

    doubleClickEvent(args: DoubleClickEventArgs){
        this.DoubleClick.emit(args);
    }

}
