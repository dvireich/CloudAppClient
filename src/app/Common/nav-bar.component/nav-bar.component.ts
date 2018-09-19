import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IPathBreak } from "./ipath-break";

@Component({
    selector: 'nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavagationBar {

    backButtonDisabled: boolean;
    private _pathBreaks: IPathBreak[];

    @Input()
    set pathBreaks(value :IPathBreak[]) {
        this._pathBreaks = value;
        this.checkIfNeedToDisableBackButton();

    } 
    @Output() PathBreakClick: EventEmitter<string> = new EventEmitter<string>();

    onPathBreakClick(pathBreakIndex: number) {
        if(pathBreakIndex === null || pathBreakIndex === undefined){
            if(this._pathBreaks.length === 1) return;
            pathBreakIndex = this._pathBreaks.length-2;
        }
        let fullPath = this._pathBreaks[pathBreakIndex].path === '' || this._pathBreaks[pathBreakIndex].path === undefined ?
        this._pathBreaks[pathBreakIndex].pathBreak :
        `${this._pathBreaks[pathBreakIndex].path}/${this._pathBreaks[pathBreakIndex].pathBreak}`       
        this.PathBreakClick.emit(fullPath);
    }

    checkIfNeedToDisableBackButton(){
        if(this._pathBreaks === null || 
            this._pathBreaks === undefined ||
            this._pathBreaks.length < 2) {
            this.backButtonDisabled = true;
            return;
        }

        this.backButtonDisabled = false;
    }


}