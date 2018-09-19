import { IPathBreak } from "./ipath-break";

export class PathBreak implements IPathBreak{
    constructor(public pathBreak: string, public path: string){
    }
    
}