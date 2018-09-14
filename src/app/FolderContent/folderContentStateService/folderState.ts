import { IFolderState } from "./IFolderState";

export class FolderState implements IFolderState{
    constructor(public currentFolderName: string,
                public currentFolderPath: string,
                public currentPage: number){}
}