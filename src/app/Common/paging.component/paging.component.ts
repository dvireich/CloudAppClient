import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FillPipe } from "../fillPipe";

@Component({
    selector: 'paging-nav',
    templateUrl: './paging.component.html',
    styleUrls: ['./paging.component.css']
})
export class PagingNav {

    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
    @Input()
    set numberOfPages(value: number) {
        this._numberOfPages = value;
        this.updateVisiblePageNumbers();
    }

    updateVisiblePageNumbers() {
        let arrayOfIncreasingNumbers = this.fillPipe.transform(this._numberOfPages);
        if(this._currentPage + 5 > this._numberOfPages){
            let start = this._numberOfPages -5 < 0 ? 0 : this._numberOfPages -5;
            this._visiblePageNumbers = arrayOfIncreasingNumbers.slice(start, this._numberOfPages);
        }
        else{
            this._visiblePageNumbers = arrayOfIncreasingNumbers.slice(this._currentPage -1, this._currentPage + 4);
        }
    }

    get numberOfPages(): number {
        return this._numberOfPages;
    }

    private _currentPage: number = 1;
    private _visiblePageNumbers: number[];
    private _numberOfPages: number;
    private fillPipe = new FillPipe();


    onPageChange(pageNum: number) {
        this._currentPage = pageNum;
        this.pageChange.emit(pageNum);
        this.updateVisiblePageNumbers();
    }

    onNextPage() {
        this._currentPage = this._currentPage === this.numberOfPages ? this._currentPage : this._currentPage + 1;
        this.pageChange.emit(this._currentPage);
        this.updateVisiblePageNumbers();
    }

    onPrevPage() {
        this._currentPage = this._currentPage === 1 ? this._currentPage : this._currentPage - 1;
        this.pageChange.emit(this._currentPage);
        this.updateVisiblePageNumbers();
    }
}