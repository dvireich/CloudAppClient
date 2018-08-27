import { Component, Input, AfterViewInit, EventEmitter, Output } from "@angular/core";
import { IContexMenuCoordinates } from "../../Common/contexMenu.component/IContexMenuCoordinates";
import { folderContentType } from "../folderContentType";
import { EnterFolderArgs } from "./enterFolderArgs";

@Component({
    templateUrl: "./select-able.Component.html",
    selector: "select-able",
    styleUrls: ["./select-able.Component.css"]
})

export class SelectableComponent implements AfterViewInit {
    @Input() text: string;
    @Input() type: folderContentType;
    @Input() path: string;
    @Output() RegisterInParent: EventEmitter<SelectableComponent> = new EventEmitter<SelectableComponent>();
    @Output() UnSelectAll: EventEmitter<void> = new EventEmitter<void>();
    @Output() ApplyIgnoreDisableSelection: EventEmitter<void> = new EventEmitter<void>();
    @Output() ApplyParentIgnoreOnRightClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() ShowContexMenu : EventEmitter<IContexMenuCoordinates> = new EventEmitter<IContexMenuCoordinates>();
    @Output() EnterFolderByDbClick : EventEmitter<EnterFolderArgs> = new EventEmitter<EnterFolderArgs>();
    color: string = "LightGrey";
    private notSelected: boolean = true;
    
    private getImgSrc(): string{
        return this.type === folderContentType.file ? "http://www.haipic.com/icon/38089/38089.png" :
                                                      "https://dumielauxepices.net/sites/default/files/folder-icons-transparent-613037-9176493.png"
    }

    onClick(): void{
        if (this.notSelected) {
            this.select();
        }
        else {
            this.unSelect();
        }
    }

    onDbClick(){
        let args = new EnterFolderArgs();
        args.Name = this.text;
        args.Path = this.path;
        this.EnterFolderByDbClick.emit(args);
    }

    private select(applyIgnoreDisableSelection : boolean = true) {
        this.UnSelectAll.emit();
        this.color = "#80d4ff";
        this.notSelected = false;
        if(!applyIgnoreDisableSelection) return;
        this.ApplyIgnoreDisableSelection.emit();
    }

    isSeletcted(): boolean{
        return !this.notSelected;
    }

    unSelect() : void {
        this.color = "LightGrey";
        this.notSelected = true;
    }

    ngAfterViewInit(): void {
        this.RegisterInParent.emit(this);
    }

    onrightClick(event : IContexMenuCoordinates) : void{
        this.select(false);
        this.ApplyParentIgnoreOnRightClick.emit();
        this.ShowContexMenu.emit(event);
    }
}