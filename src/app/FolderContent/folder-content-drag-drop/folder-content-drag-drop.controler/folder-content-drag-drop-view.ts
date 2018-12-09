import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";

export interface IFolderContentDragAndDropView{

    showMessage :
        (message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void)  => void
}