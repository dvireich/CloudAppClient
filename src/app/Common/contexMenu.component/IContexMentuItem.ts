export interface IContexMentuItem{
    name: string;
    onClick: ()=>void;
    needToshow : ()=> boolean
    showAllways: boolean;
}