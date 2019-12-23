import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IPathBreak } from "../../Common/nav-bar.component/ipath-break";
import { PathBreak } from "../../Common/nav-bar.component/path-break";


@Component({
    selector: 'folder-content-nav-bar-path-break',
    templateUrl: './folder-content-nav-bar-path-break.html',
    styleUrls: ['./folder-content-nav-bar-path-break.css']
})
export class FolderContentNavBarPathBreak {

    private _path: string;
    pathBreaks: IPathBreak[];

    @Input() public set Path(value: string) {
        this._path = value;
        this.pathBreaks = this.breakPathIntoPathBreaks(this._path);
    }
    @Input() DisableRefresh: boolean;

    @Output() PathBarClick: EventEmitter<string> = new EventEmitter<string>();

    onPathBarClick(fullPath: string) {
        this.PathBarClick.emit(fullPath);
    }

    breakPathIntoPathBreaks(path: string): IPathBreak[] {

        if(path === undefined || path === null) return [];

        let splittedPath = path.split('\\');
        splittedPath = splittedPath.filter(p => p !== "" && p !== null && p !== undefined);
        const result: IPathBreak[] = new Array<IPathBreak>();

        for (let i: number = 0; i < splittedPath.length; i++) {
            const pathBreak = splittedPath[i];
            const fullPathBreaks = splittedPath.slice(0, i);
            const fullPath = fullPathBreaks.reduce((prev, currVal) => prev + '\\' + currVal, '');
            result.push(new PathBreak(pathBreak, fullPath));
            console.log(result);
        }
        return result;
    }
}
