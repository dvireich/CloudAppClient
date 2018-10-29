import { IMultiLevelContexMenuItem } from "./imulti-level-contex-menu-item";
import { IContexMentuItem } from "../contex-menu.component/icontex-mentu-item";

export class MultiLevelContexMenuItem implements IMultiLevelContexMenuItem {
    contaxMenuItem: IContexMentuItem[];
    show: boolean;
}