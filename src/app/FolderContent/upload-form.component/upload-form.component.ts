import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UploadArgs } from './upload-args';
import { IUploadArgs } from './iupload-args';

@Component({
  selector: 'upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadForm {
  form: FormGroup;
  loading: boolean = false;
  disableAddButon: boolean = true;

  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() onCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSubmit: EventEmitter<IUploadArgs> = new EventEmitter<IUploadArgs>();


  constructor(private fb: FormBuilder) {
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
      this.form.get('avatar').setValue({
        filename: file.name,
        filetype: file.type,
        value: reader.result,
        size: file.size,
        file: file
      })
    }
  }

  onSubmitClick() {
    const formModel = this.form.value;
    this.loading = true;
    let userFileName = this.form.get('name').value;
    let newFileNameWithExtention = this.createFileSuffix(userFileName, formModel.avatar.filename);
    this.onSubmit.emit(new UploadArgs(
      newFileNameWithExtention,
      formModel.avatar.filetype,
      formModel.avatar.value,
      formModel.avatar.size,
      formModel.avatar.file
    ))
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