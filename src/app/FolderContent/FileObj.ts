import { IFile } from "./IFile";
import { FolderContent } from "./FolderContent";
import { folderContentType } from "./folderContentType";
import { FolderObj } from "./FolderObj";

export class FileObj extends FolderContent implements IFile{
    constructor(){
        super();
        this.Type = folderContentType.file;
    }

    equals(other : any): boolean {
        console.log("file equals: "+ other.constructor.name +" (instanceof FolderContent)= "+ (other instanceof FolderContent));
        return other instanceof FileObj &&
               super.equals(other);
    }
}