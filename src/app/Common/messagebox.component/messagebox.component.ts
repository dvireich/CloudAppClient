import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { MessageBoxType } from "./messageBoxType";
import { MessageBoxButton } from "./messageBoxButtons";

@Component({
    selector: "message-box",
    templateUrl: "./messagebox.component.html",
    styleUrls: ["./messagebox.component.css"]
})
export class MessageBox implements OnInit{

    ngOnInit(): void {
        this.setButtonsVisibility();
    }
    @Input() text: string = "message text";
    
    @Input() messageIcon: MessageBoxType = MessageBoxType.Error;
    @Input() buttons: MessageBoxButton = MessageBoxButton.YesNo;
    @Output() onButton1Click: EventEmitter<string> = new EventEmitter<string>();
    @Output() onButton2Click: EventEmitter<string> = new EventEmitter<string>();

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
        this.onButton1Click.emit("");
    }

    button2Click(){
        this.onButton2Click.emit("");
    }
    
    getMessaeImage(): string{
        if(this.messageIcon === MessageBoxType.Error){
            return "https://cdn0.iconfinder.com/data/icons/iVista2/256/Error.png";
        }
        if(this.messageIcon === MessageBoxType.Information){
            return "https://cdn3.iconfinder.com/data/icons/micro/scalable/status/dialog-information.png";
        }
        if(this.messageIcon === MessageBoxType.Question){
            return "https://cdn2.iconfinder.com/data/icons/humano2/128x128/apps/gnome-help.png";
        }
    }
}