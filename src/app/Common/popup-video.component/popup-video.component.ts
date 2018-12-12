import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'popup-video',
    templateUrl: './popup-video.component.html',
    styleUrls: ['popup-video.component.css']
})
export class PopupVideo implements OnInit{
    
    constructor() { }

    @Input() videoSrc: string;
    @Output() onCloseVideo: EventEmitter<void> = new EventEmitter<void>()

    ngOnInit(): void {
        let button = document.getElementById("openModalButton") as HTMLElement;
        button.click();
    }

    onCloseVideoClick(){
        this.onCloseVideo.emit();
    }
}