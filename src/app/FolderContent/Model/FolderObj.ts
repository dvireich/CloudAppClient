import { IFolder } from "./IFolder";
import { FolderContent } from "./FolderContent";
import { IFolderContent } from "./IFolderContent";
import { folderContentType } from "./folderContentType";


export class FolderObj extends FolderContent implements IFolder{
    
    Content : IFolderContent[] = new Array<IFolderContent>();  
    
    constructor(){
        super();
        this.Type = folderContentType.folder;
    }
    
    equals(other : any) : boolean{
        return other instanceof FolderObj &&
               super.equals(other) &&
               this.compareContent(other.Content);
    }

    private compareContent(other: IFolderContent[]): boolean{
        if(this.Content.length != other.length) return false;

        for(let i : number = 0; i < this.Content.length; i ++){
            let thisElement = this.Content[i];
            let otherElement = other[i];

            if(!thisElement.equals(otherElement)) return false;
        }
        return true;
    }
}