import { MessageBoxType } from "../../../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../../../Common/messagebox.component/messageBoxButtons";

export interface IForgotPasswordView{

    securityQuestion: string;
    password: string;
    isLoading: boolean;

    close: () => void;

    showMessage :
        (message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void)  => void
}