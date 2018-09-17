import { ISelecableProperties } from "./ISelecableProperties";

export class SelecableProperties implements ISelecableProperties{
    constructor(
        public Name: string,
        public CreationTime: string,
        public ModificationTime: string,
        public Path: string,
        public Size?: string ){
    }
}