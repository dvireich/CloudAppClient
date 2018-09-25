import { Component, Output, EventEmitter, Input } from "@angular/core";

@Component({
    selector: 'folder-content-nav-bar',
    templateUrl: './folder-content-nav-bar.html',
    styleUrls: ['./folder-content-nav-bar.css']
})
export class FolderContentNavBar{

    @Output() SearchClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() CancelClick: EventEmitter<void> = new EventEmitter<void>();
    @Input() inputText: string;
    onSearchClick(searchString: string){
        this.SearchClick.emit(searchString);
    }

    onCancelClick(){
        this.inputText = '';
        this.CancelClick.emit();
    }

}