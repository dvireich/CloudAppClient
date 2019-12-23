import { IFolder } from "../../Model/IFolder";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { sortType } from "../../Model/sortType";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { VideoArgs } from "../../helper-classes/video-args";

export interface IFolderContentContainerView{
    listOfFileFolderNames: IFolder;
    currentPage: number;
    currentPath: string;
    navBarPath: string;
    // Message box
    messageBoxResult: DialogResult;
    messageBoxText: string;
    loading: boolean;
    currentSortType: sortType;
    numberOfElementsOnPage: number;

    updateNumberOfElementsOnPageOptions: () => void;
    showVideo: (videoArgs: VideoArgs) => void;
    updateRefreshButtonState: () => void;
    showMessage: (
        message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void) => void;
}
