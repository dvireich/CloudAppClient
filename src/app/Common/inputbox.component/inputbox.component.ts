import { Component, Input, Output, EventEmitter } from "@angular/core";


@Component({
    selector: "input-box",
    templateUrl: "./inputbox.component.html",
    styleUrls: ["./inputbox.component.css"]
})
export class Inputbox{
    @Input() placeHolder: string = "Plaese enter input...";
    @Input() header: string = "Input";
    @Input() okButtonName: string = "Ok";
    @Input() cancelButtonName: string = "Cancel";
    @Input()
    @Input() onCancel: ()=>void;

    @Output() onSubmit : EventEmitter<string> = new EventEmitter<string>();

    submit(input: string){
        this.onSubmit.emit(input);
    }
}