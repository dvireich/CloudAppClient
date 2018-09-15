import { IFolderContent } from "./IFolderContent";
import { folderContentType } from "./folderContentType";


export class FolderContent implements IFolderContent{
    Type: folderContentType;
    Name: string;    
    Path: string;
    CreationTime: string
    ModificationTime: string
    
    equals(other: any) : boolean{
        return other instanceof FolderContent &&
               other.Name === this.Name &&
               other.Path === this.Path;
    }
}