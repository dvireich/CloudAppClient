import { IFolder } from "../Model/IFolder";
import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../Common/messagebox.component/messageboxResult";
import { sortType } from "../Model/sortType";

export interface IFolderContentContainerView{
    listOfFileFolderNames: IFolder;
    currentPage: number;
    navBarPath: string;
    //Message box
    messageBoxResult: DialogResult;
    messageBoxText: string;
    loading: boolean;
    currentSortType: sortType;
    numberOfElementsOnPage: number;
    

    updateNumberOfElementsOnPageOptions: ()=>void;
    updateRefreshButtonState: ()=>void;
    showMessage: (
        message: string, 
        type: MessageBoxType, 
        buttons: MessageBoxButton, 
        caption: string, 
        cont: () => void) => void

}