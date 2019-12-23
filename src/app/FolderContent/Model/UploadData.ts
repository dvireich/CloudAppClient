import { IUploadData } from "./IUploadData";

export class UploadData implements IUploadData {
    constructor(public fileName: string, public path: string, public progress: number) {
    }
}
