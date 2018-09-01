import { IFolderContent } from "./IFolderContent";
import { folderContentType } from "./folderContentType";
import { Injectable } from "@angular/core";
import { ClipBoardOperation } from "./clipBoardOperation";

@Injectable({
    providedIn: "root"
  })
export class FolderContentClipBoard{
    private folderContent: IFolderContent;
    private operation: ClipBoardOperation

    AddToClipBoard(folderContent: IFolderContent, operation: ClipBoardOperation){
        this.folderContent = folderContent;
        this.operation = operation;
    }

    popClipBoardObj(): IFolderContent{
        let clipboardobj =  this.folderContent;
        this.ClearClipBoard();
        return clipboardobj;
    }

    popClipBoardOperation(): ClipBoardOperation{
        return this.operation;
    }

    ClearClipBoard(){
        this.folderContent =  null;
        this.operation = null;
    }
}