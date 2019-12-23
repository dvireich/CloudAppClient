import { folderContentType } from "./folderContentType";

export interface IFolderContent{
    Name: string;
    RelativePath: string;
    Type: folderContentType;
    CreationTime: string
    ModificationTime: string

    equals(other: any) : boolean;
}
