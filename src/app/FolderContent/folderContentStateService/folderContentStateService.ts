import { Injectable } from "@angular/core";
import { IFolder } from "../IFolder";
import { IFolderState } from "./IFolderState";
import { FolderState } from "./folderState";

@Injectable({
    providedIn: "root"
  })
  export class FolderContentStateService {
    private currentFolder: IFolder;
    private currentPage: number;

    setCurrentFolderState(currentFolder: IFolder, currentPage: number){
        this.currentFolder = currentFolder;
        this.currentPage = currentPage;
    }

    restoreFolderState(): IFolderState{
        if(this.currentFolder === null || this.currentFolder === undefined){
            return new FolderState('"home"', '""', 1);
        }
        return new FolderState(this.currentFolder.Name, this.currentFolder.Path , this.currentPage);
    }
  }