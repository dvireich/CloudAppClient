import { IContexMentuItem } from "./icontex-mentu-item";

export class ContexMentuItem implements IContexMentuItem{
    name: string;    onClick: () => void;
    needToshow: () => boolean;
    showAllways: boolean;
}