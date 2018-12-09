import { IUploadArgs } from "./iupload-args";

export class UploadArgs implements IUploadArgs{
    constructor(
        public fileNameWithExtention: string, 
        public fileType: string,
        public fileSize: number,
        public file: any){}

}