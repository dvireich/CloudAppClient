import { IContexMentuItem } from "./IcontexMentuItem";

export class ContexMentuItem implements IContexMentuItem{
    name: string;    onClick: () => void;
    needToshow: () => boolean;
    showAllways: boolean;
}