import { folderContentType } from "./folderContentType";

export interface IFolderContent{
    Name: string;
    Path: string;
    Type: folderContentType;
    CreationTime: string
    ModificationTime: string

    equals(other: any) : boolean;
}