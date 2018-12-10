export class FolderContentInputArgs{
    constructor(
    public placeHolder: string,
    public header: string,
    public okBUttonName: string,
    public onSubmit: (input: string) => void,
    public onCancel: () => void,
    public cont: () => void){}
}