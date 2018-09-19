import { IUploadContainerState } from "./iupload-container-state";

export class UploadContainerState implements IUploadContainerState{
    constructor(public Visibility: string, public Height: string){

    }
}