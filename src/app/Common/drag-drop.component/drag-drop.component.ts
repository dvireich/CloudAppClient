import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'drag-and-drop-files',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css']
})
export class DragAndDropFilesComponent {
  private fileList: File[] = [];
  private invalidFiles: File[] = [];
  color: string = "lightgray";
  @Output() onFilesDrop: EventEmitter<Array<File>> = new EventEmitter<Array<File>>();
  @Output() onError: EventEmitter<string> = new EventEmitter<string>();
  constructor() {

  }

  @Input() private allowed_extensions: string[] = [];

  onFilesChange(fileList: File[]) {
    console.log(fileList);
    this.fileList = fileList;
    this.onFilesDrop.emit(fileList);
  }

  onFileInvalids(fileList: File[]) {
    this.invalidFiles = fileList;
  }

  onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if(!this.validateItems(evt)) return;

    let files : File[] = evt.dataTransfer.files;
    let valid_files: File[] = [];
    let invalid_files: File[] = [];
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        let file: any = files[i];
        let ext = file.name.split('.')[file.name.split('.').length - 1];
        if (this.allowed_extensions.length === 0 || this.allowed_extensions.lastIndexOf(ext) != -1) {
          valid_files.push(file);
        } else {
          invalid_files.push(file);
        }
      }
      this.fileList = valid_files;
      this.invalidFiles = invalid_files;
      this.onFilesDrop.emit(valid_files);
    }
  }

  onOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.color = "gray"
  }

  onLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.color = "lightgray";
  }

  validateNoFolderAmongDroppedItems(evt): boolean {
    let items = evt.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      let item: any = items[i];
      const entry = item.webkitGetAsEntry();
      if (entry.isDirectory) {
        this.onError.emit("There is a folder among the dropped items. This is forbidden");
        return false;
      }
    }
    return true;
  }

  validateOneFileDragged(evt): boolean{
    let files : File[] = evt.dataTransfer.files;
    if (files.length > 1) {
      this.onError.emit("More than one item has been dragged. This is forbidden");
      return false;
    }
    return true;
  }

  validateItems(evt): boolean{
    return this.validateOneFileDragged(evt) && 
           this.validateNoFolderAmongDroppedItems(evt);
  }
}