import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "message-box",
    templateUrl: "./messagebox.component.html",
    styleUrls: ["./messagebox.component.css"]
})
export class MessageBox{
    @Input() text: string = "message text";
    @Input() okButtonName: string = "Yes";
    @Input() cancelButtonName: string = "No";
    @Input() onCancel: ()=>void;

    @Output() onSubmit : EventEmitter<string> = new EventEmitter<string>();

    submit(input: string){
        this.onSubmit.emit(input);
    }
}