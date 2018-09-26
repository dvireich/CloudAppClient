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
        if(this.currentPage + 5 > this._numberOfPages){
            let start = this._numberOfPages -5 < 0 ? 0 : this._numberOfPages -5;
            this.visiblePageNumbers = arrayOfIncreasingNumbers.slice(start, this._numberOfPages);
        }
        else{
            this.visiblePageNumbers = arrayOfIncreasingNumbers.slice(this.currentPage -1, this.currentPage + 4);
        }
    }

    get numberOfPages(): number {
        return this._numberOfPages;
    }

     currentPage: number = 1;
     visiblePageNumbers: number[];
    private _numberOfPages: number;
    private fillPipe = new FillPipe();


    onPageChange(pageNum: number) {
        this.currentPage = pageNum;
        this.pageChange.emit(pageNum);
        this.updateVisiblePageNumbers();
    }

    onNextPage() {
        this.currentPage = this.currentPage === this.numberOfPages ? this.currentPage : this.currentPage + 1;
        this.pageChange.emit(this.currentPage);
        this.updateVisiblePageNumbers();
    }

    onPrevPage() {
        this.currentPage = this.currentPage === 1 ? this.currentPage : this.currentPage - 1;
        this.pageChange.emit(this.currentPage);
        this.updateVisiblePageNumbers();
    }
}