import { NgModule } from '@angular/core';
import { SelectableComponent } from './select-able.component/select-able.component';
import { FolderContentContainter } from './folder-content-container.component/folder-content-container.component';
import { Base64UploadComponent } from './uploadForm.component/uploadForm.component';
import { UploadProgressContainer } from './upload-progress-container.component/upload-progress-container.component';
import { FolderContentPagingNav } from './folderContent-Paging.component/folderContent-Paging.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../Common/common.module';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'workspace', component: FolderContentContainter }
    ]),
    SharedModule
  ],
  declarations: [
    SelectableComponent,
    FolderContentContainter,
    Base64UploadComponent,
    UploadProgressContainer,
    FolderContentPagingNav
  ]
})
export class FolderContentModule { }
