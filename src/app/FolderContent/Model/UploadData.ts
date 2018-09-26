import { IUploadData } from "./IUploadData";

export class UploadData implements IUploadData{
    constructor(public fileName: string, public requestId: number, public progress: number){    
    }
}