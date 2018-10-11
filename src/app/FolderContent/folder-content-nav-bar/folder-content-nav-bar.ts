import { Component, Output, EventEmitter, Input, AfterViewInit } from "@angular/core";

@Component({
    selector: 'folder-content-nav-bar',
    templateUrl: './folder-content-nav-bar.html',
    styleUrls: ['./folder-content-nav-bar.css']
})
export class FolderContentNavBar implements AfterViewInit {

    @Output() SearchClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() CancelClick: EventEmitter<void> = new EventEmitter<void>();
    @Output() RegisterInParent: EventEmitter<FolderContentNavBar> = new EventEmitter<FolderContentNavBar>();
    inputText: string;
    navbarOpen = false;

    toggleNavbar() {
        this.navbarOpen = !this.navbarOpen;
    }

    onSearchClick(searchString: string) {
        this.SearchClick.emit(searchString);
    }

    onCancelClick() {
        this.inputText = '';
        this.CancelClick.emit();
    }

    ngAfterViewInit(): void {
        this.RegisterInParent.emit(this);
    }

    clearSearchText() {
        this.inputText = '';
    }

}