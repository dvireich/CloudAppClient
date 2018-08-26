import { IFolderContent } from "./IFolderContent";

export interface IFolder extends IFolderContent{
    Content: IFolderContent[];
}