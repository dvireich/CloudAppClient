import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef} from "@angular/core";
import { MessageBoxType } from "./messageBoxType";
import { MessageBoxButton } from "./messageBoxButtons";
import { DialogResult } from "./messageboxResult";

@Component({
    selector: "message-box",
    templateUrl: "./messagebox.component.html",
    styleUrls: ["./messagebox.component.css"]
})
export class MessageBox implements OnInit, AfterViewInit {

    ngAfterViewInit(): void {
    }

    ngOnInit(): void {
        this.setButtonsVisibility();
    }
    @Input() text: string = "message text";
    @Input() caption: string = "caption";
    @Input() messageIcon: MessageBoxType = MessageBoxType.Error;
    @Input() buttons: MessageBoxButton = MessageBoxButton.YesNo;

    @Output() onButton1Click: EventEmitter<DialogResult> = new EventEmitter<DialogResult>();
    @Output() onButton2Click: EventEmitter<DialogResult> = new EventEmitter<DialogResult>();

    private button1Visible: boolean;
    private button2Visible: boolean;

    private button1Name: string = "button1";
    private button2Name: string = "button2";

    setButtonsVisibility(){
        if(this.buttons ===  MessageBoxButton.YesNo){
            this.button1Name = "Yes";
            this.button2Name = "No"; 

            this.button1Visible = true;
            this.button2Visible = true;
        }

        if(this.buttons ===  MessageBoxButton.OkCancel){
            this.button1Name = "Ok";
            this.button2Name = "Cancel";

            this.button1Visible = true;
            this.button2Visible = true;
        }

        if(this.buttons ===  MessageBoxButton.Ok){
            this.button1Name = "Ok";

            this.button1Visible = true;
            this.button2Visible = false;
        }
    }

    button1Click(){
        let result : DialogResult;
        if(this.buttons == MessageBoxButton.YesNo){
            result = DialogResult.Yes;
        }
        if(this.buttons == MessageBoxButton.OkCancel){
            result = DialogResult.Ok;
        }
        if(this.buttons == MessageBoxButton.Ok){
            result = DialogResult.Ok;
        }

        this.onButton1Click.emit(result);
    }

    button2Click(){
        let result : DialogResult;
        if(this.buttons == MessageBoxButton.YesNo){
            result = DialogResult.No;
        }
        if(this.buttons == MessageBoxButton.OkCancel){
            result = DialogResult.Cancel;
        }
 
        this.onButton2Click.emit(result);
    }
    
    getMessaeImage(): string{
        if(this.messageIcon === MessageBoxType.Error){
            return "../../api/Resources/error.png";
        }
        if(this.messageIcon === MessageBoxType.Information){
            return "../../api/Resources/information.png";
        }
        if(this.messageIcon === MessageBoxType.Question){
            return "../../../api/Resources/question.png";
        }
    }
}