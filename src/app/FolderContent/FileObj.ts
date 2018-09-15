import { IFile } from "./IFile";
import { FolderContent } from "./FolderContent";
import { folderContentType } from "./folderContentType";

export class FileObj extends FolderContent implements IFile{
    Size: string;

    constructor(){
        super();
        this.Type = folderContentType.file;
    }

    equals(other : any): boolean {
        return other instanceof FileObj &&
               super.equals(other);
    }
}