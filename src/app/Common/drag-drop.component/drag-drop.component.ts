import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'drag-and-drop-files',
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css']
})
export class DragAndDropFilesComponent {
  private fileList : File[] = [];
  private invalidFiles : File[] = [];
  color: string = "lightgray";
  @Output() onFilesDrop : EventEmitter<Array<File>> = new EventEmitter<Array<File>>();
  @Output() onError: EventEmitter<string> = new EventEmitter<string>();
  constructor() {

   }

  @Input() private allowed_extensions : string[] = [];

  onFilesChange(fileList : File[]){
    console.log(fileList);
    this.fileList = fileList;
    this.onFilesDrop.emit(fileList);
  }

  onFileInvalids(fileList : File[]){
    this.invalidFiles = fileList;
  }

  onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    let files = evt.dataTransfer.files;
    let valid_files : File[] = [];
    let invalid_files : File[] = [];
    if(files.length > 1){
      this.onError.emit("More than one file been dragged. This is forbidden");
      return;
    }

    if(files.length > 0){
      for(let i = 0; i < files.length; i++){
        let file: File = files[i];
        let ext = file.name.split('.')[file.name.split('.').length - 1];
        if(this.allowed_extensions.length === 0 || this.allowed_extensions.lastIndexOf(ext) != -1){
          valid_files.push(file);
        }else{
          invalid_files.push(file);
        }
      }
      if(!valid_files.every(file => file.type !== "")){
        this.onError.emit("There is a folder among the file. This is forbidden");
        return;
      }
      this.fileList = valid_files;
      this.invalidFiles = invalid_files;
      this.onFilesDrop.emit(valid_files);
    }
  }

  onOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.color = "gray"
  }

  onLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.color = "lightgray";
  }

}