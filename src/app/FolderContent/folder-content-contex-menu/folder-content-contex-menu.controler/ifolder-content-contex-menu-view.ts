import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";
import { DialogResult } from "../../../Common/messagebox.component/messageboxResult";
import { IFolderContent } from "../../Model/IFolderContent";
import { VideoArgs } from "../../helper-classes/video-args";

export interface IFolderContentContexMenuView{

    currentPage: number;
    currentPath: string;

    showLoadingLayer: (show: boolean) => void;
    showPopupVideo: (videoArgs: VideoArgs) => void;
    showMessage: (
        message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: (reslut: DialogResult) => void) => void;
}
