import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FolderContnentService } from '../../FolderContent/FolderContentService/folder-content-service';

@Component({
  selector: 'base64-upload',
  templateUrl: './uploadForm.component.html',
  styleUrls: ['./uploadForm.component.css']
})
export class Base64UploadComponent {
  form: FormGroup;
  loading: boolean = false;
  disableAddButon: boolean = true;

  @ViewChild('fileInput') fileInput: ElementRef;
  @Input() currentFolderPath: string;
  @Input() onErrorUpload: (message: string) => void;
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onAddEnd: EventEmitter<void> = new EventEmitter<void>();
  @Output() onAddStart: EventEmitter<void> = new EventEmitter<void>();


  constructor(private fb: FormBuilder, private folderContentService: FolderContnentService) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      avatar: null
    });
  }

  onFileChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.get('avatar').setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result,
          size: file.size
        })
      };
    }
  }

  onSubmit() {
    const formModel = this.form.value;
    this.loading = true;
    let userFileName = this.form.get('name').value;
    let newFileNameWithExtention = this.createFileSuffix(userFileName, formModel.avatar.filename);
    this.folderContentService.createFile(newFileNameWithExtention, 
                                         this.currentFolderPath ,
                                         formModel.avatar.filetype, 
                                         formModel.avatar.value, 
                                         formModel.avatar.size,
                                         ()=> this.onAddEnd.emit(),
                                         this.onErrorUpload);
  this.onAddStart.emit();
  }

  createFileSuffix(userFileName: string, originalFileName: string) : string {
    let suffixStart = originalFileName.lastIndexOf('.');
    let suffix = originalFileName.substring(suffixStart);
    let newFileNameWithSuffix = `${userFileName}${suffix}`;
    return newFileNameWithSuffix;
  }

  clearFile() {
    this.form.get('avatar').setValue(null);
    this.fileInput.nativeElement.value = '';
  }

  cancel(){
    this.onCancel.emit();
  }

  shouldDisableAddButon(){
    this.disableAddButon = 
          !(this.fileInput.nativeElement.value !== undefined &&
           this.fileInput.nativeElement.value !== null &&
           this.fileInput.nativeElement.value.length > 0 &&
           this.form.value.avatar !== null);
  }
}