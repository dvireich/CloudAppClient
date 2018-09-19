import { IFolderState } from "./ifolder-state";

export class FolderState implements IFolderState{
    constructor(public currentFolderName: string,
                public currentFolderPath: string,
                public currentPage: number){}
}