import { IFolder } from "./IFolder";
import { FolderContent } from "./FolderContent";
import { IFolderContent } from "./IFolderContent";
import { folderContentType } from "./folderContentType";
import { sortType } from "./sortType";


export class FolderObj extends FolderContent implements IFolder {

    CurrentContentPage: IFolderContent[] = new Array<IFolderContent>();
    SortType: sortType;

    constructor() {
        super();
        this.Type = folderContentType.folder;
    }

    equals(other: any): boolean {
        return other instanceof FolderObj &&
               super.equals(other) &&
               this.compareContent(other.CurrentContentPage);
    }

    private compareContent(other: IFolderContent[]): boolean{
        if(this.CurrentContentPage.length != other.length) return false;

        for(let i: number = 0; i < this.CurrentContentPage.length; i ++){
            let thisElement = this.CurrentContentPage[i];
            let otherElement = other[i];

            if(!thisElement.equals(otherElement)) return false;
        }
        return true;
    }
}
