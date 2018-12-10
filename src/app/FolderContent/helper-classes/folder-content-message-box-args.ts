import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";

export class FolderContentMessageBoxArgs{
    constructor(
        public message: string,
        public type: MessageBoxType, 
        public buttons: MessageBoxButton, 
        public caption: string, 
        public cont: (reslut: DialogResult) => void){}
}