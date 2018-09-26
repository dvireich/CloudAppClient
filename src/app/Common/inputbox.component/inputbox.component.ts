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
    @Input() caption: string = "Caption";
    @Input() okButtonName: string = "Ok";
    @Input() cancelButtonName: string = "Cancel";
    @Input() onCancel: ()=>void;

    @Output() onSubmit : EventEmitter<string> = new EventEmitter<string>();

    @ViewChild('TextInput') TextInput: ElementRef;

    

    okButtonDisabled : boolean;
    inputText : string = "";
    submit(input: string){
        this.onSubmit.emit(input);
    }

    shouldOkButtonDisabled(event : any) : void {
        let disable = this.isEmptyOrSpaces(this.inputText);
        this.okButtonDisabled = disable;
    }

    isEmptyOrSpaces(str : string){
        return str === undefined || str === null || str.length === 0;
    }

    onEnterDown(){
        this.shouldOkButtonDisabled(null);
        if(this.okButtonDisabled) return;

        this.submit(this.inputText);
    }
}