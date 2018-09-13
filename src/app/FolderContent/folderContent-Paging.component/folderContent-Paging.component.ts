import { Component, EventEmitter, Output } from "@angular/core";
import { FolderContnentService } from "../FolderContentService/folder-content-service";

@Component({
    selector: 'folder-content-paging-nav',
    templateUrl: './folderContent-Paging.component.html',
    styleUrls: ['./folderContent-Paging.component.css']
})
export class FolderContentPagingNav{

    constructor(private folderContentService: FolderContnentService){
        folderContentService.subscriberToPageChangedToAction(this, this.onNumOfPagesChanged.bind(this));
    }

    private _numOfPages: number = 1;
    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();

    onNumOfPagesChanged(numOfPages: number){
        this._numOfPages = numOfPages;
    }

    onPageChanged(pageNum: number){
        this.pageChange.emit(pageNum);
    }
}