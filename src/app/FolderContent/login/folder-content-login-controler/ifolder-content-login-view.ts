import { LoginTabs } from "../folder-content-login.component/login-mode";
import { MessageBoxType } from "../../../Common/messagebox.component/messageBoxType";
import { MessageBoxButton } from "../../../Common/messagebox.component/messageBoxButtons";

export interface IFolderContentLoginView{
    userNameMessage: string;
    passwordMessage: string;
    registerUserNameMessage: string;
    registerPasswordMessage: string;
    registerRecoveryQuestionMessage: string;
    registerRecoveryAnswerMessage: string;
    usernameInputText: string;
    passwordInputText: string;
    isLoading: boolean;
    rememberMe: boolean;
    needToShowComponent: boolean;
    loginTab: LoginTabs;

    showMessage :
        (message: string,
        type: MessageBoxType,
        buttons: MessageBoxButton,
        caption: string,
        cont: () => void)  => void
}