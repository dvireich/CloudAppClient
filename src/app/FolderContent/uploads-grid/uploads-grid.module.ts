import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadsGrid } from './upload-progress-container.component/uploads-grid.component';
import { UploadProgressRow } from './upload-progress-container.component/upload-progress-row.component/upload-progress-row.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UploadProgressRow,
    UploadsGrid
  ],
  exports: [
    UploadsGrid
  ]
})
export class UploadsGridModule { }
