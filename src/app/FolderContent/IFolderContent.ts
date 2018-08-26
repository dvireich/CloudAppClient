import { folderContentType } from "./folderContentType";

export interface IFolderContent{
    Name: string;
    Path: string;
    Type: folderContentType;

    equals(other: any) : boolean;
}