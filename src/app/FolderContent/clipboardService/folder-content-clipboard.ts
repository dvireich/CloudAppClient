import { IFolderContent } from "../Model/IFolderContent";
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

    peekClipBoardObj() : IFolderContent{
        return this.folderContent;
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