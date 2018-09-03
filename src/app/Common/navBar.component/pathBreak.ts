import { IPathBreak } from "./IPathBreak";

export class PathBreak implements IPathBreak{
    constructor(public pathBreak: string, public path: string){
    }
    
}