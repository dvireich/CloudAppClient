import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { IFolderContent } from "../../Model/IFolderContent";

export interface IFolderContentContexMenuView{
    
    currentPage: number;
    currentPath: string;
    messageBoxResult: DialogResult;

    showLoadingLayer: (show: boolean) => void;
    showMessage: (
        message: string, 
        type: MessageBoxType, 
        buttons: MessageBoxButton, 
        caption: string, 
        cont: () => void) => void
}