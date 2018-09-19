import { Component, EventEmitter, Output } from "@angular/core";
import { FolderContnentService } from "../Folder-content-service/folder-content-service";

@Component({
    selector: 'folder-content-paging-nav',
    templateUrl: './folder-content-paging.component.html',
    styleUrls: ['./folder-content-paging.component.css']
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