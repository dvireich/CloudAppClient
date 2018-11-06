export interface IContexMentuItem{
    name: string;
    onClick: ()=>void;
    onOverIn: ()=>void;
    needToshow : ()=> boolean
    showAllways: boolean;
    subs: IContexMentuItem[];
    styleClasses: string[];
}