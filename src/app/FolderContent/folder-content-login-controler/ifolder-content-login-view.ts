import { MessageBoxType } from "../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../Common/messagebox.component/messageBoxButtons";

export interface IFolderContentLoginView{
    userNameMessage: string;
    passwordMessage: string;
    isLoading: boolean;
    rememberMe: boolean;
    needToShowComponent: boolean;

    showMessage :
        (message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void)  => void
}