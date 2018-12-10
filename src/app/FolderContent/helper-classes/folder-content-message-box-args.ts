import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";

export class FolderContentMessageBoxArgs{
    constructor(
        public message: string,
        public type: MessageBoxType, 
        public buttons: MessageBoxButton, 
        public caption: string, 
        public cont: () => void){}
}