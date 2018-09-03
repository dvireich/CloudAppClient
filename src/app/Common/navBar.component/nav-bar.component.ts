import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IPathBreak } from "./IPathBreak";

@Component({
    selector: 'nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.css']
})
export class NavagationBar {
    @Input() pathBreaks: IPathBreak[];
    @Output() PathBreakClick: EventEmitter<string> = new EventEmitter<string>();

    onPathBreakClick(pathBreakIndex: number) {
        if(pathBreakIndex === null || pathBreakIndex === undefined){
            if(this.pathBreaks.length === 1) return;
            pathBreakIndex = this.pathBreaks.length-2;
        }
        let fullPath = this.pathBreaks[pathBreakIndex].path === '' || this.pathBreaks[pathBreakIndex].path === undefined ?
        this.pathBreaks[pathBreakIndex].pathBreak :
        `${this.pathBreaks[pathBreakIndex].path}/${this.pathBreaks[pathBreakIndex].pathBreak}`       
        this.PathBreakClick.emit(fullPath);
    }
}