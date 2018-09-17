import { IUploadContainerState } from "./IUploadContainerState";

export class UploadContainerState implements IUploadContainerState{
    constructor(public Visibility: string, public Height: string){

    }
}