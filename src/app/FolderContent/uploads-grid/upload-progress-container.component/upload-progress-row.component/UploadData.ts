import { IUploadData } from "./IuploadData";

export class UploadData implements IUploadData{
    constructor(public fileName: string, public requestId: number, public progress: number){    
    }
}