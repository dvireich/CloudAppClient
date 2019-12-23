import { IFolderContent } from "./IFolderContent";
import { sortType } from "./sortType";

export interface IFolder extends IFolderContent{
    CurrentContentPage: IFolderContent[];
    SortType: sortType;
}