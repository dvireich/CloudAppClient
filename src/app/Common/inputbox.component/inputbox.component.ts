import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from "@angular/core";


@Component({
    selector: "input-box",
    templateUrl: "./inputbox.component.html",
    styleUrls: ["./inputbox.component.css"]
})
export class Inputbox implements AfterViewInit{

    ngAfterViewInit(): void {
        this.TextInput.nativeElement.focus();
    }

    @Input() placeHolder: string = "Plaese enter input...";
    @Input() header: string = "Input";
    @Input() okButtonName: string = "Ok";
    @Input() cancelButtonName: string = "Cancel";
    @Input() onCancel: ()=>void;

    @Output() onSubmit : EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('TextInput') TextInput: ElementRef;

    

    okButtonDisabled : boolean;
    private inputText : string = "";
    submit(input: string){
        this.onSubmit.emit(input);
    }

    shouldOkButtonDisabled(event : any) : void {
        console.log(this.inputText);
        let disable = this.isEmptyOrSpaces(this.inputText);
        this.okButtonDisabled = disable;
    }

    isEmptyOrSpaces(str : string){
        return str === undefined || str === null || str.length === 0;
    }
}