import { NgModule } from '@angular/core';
import { FolderContentContainter } from './folder-content-container.component/folder-content-container.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../Common/common.module';
import { SelectableGridModule } from './selectable-grid/selectable-grid.module';
import { UploadsGridModule } from './uploads-grid/uploads-grid.module';
import { UploadForm } from './upload-form.component/upload-form.component';
import { FolderContentPagingNav } from './folder-content-paging.component/folder-content-paging.component';
import { FolderContentNavBar } from './folder-content-nav-bar/folder-content-nav-bar';
import { FolderContentPropertyInfo } from './folder-content-property-info/folder-content-property-info';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'workspace', component: FolderContentContainter }
    ]),
    SharedModule,
    SelectableGridModule,
    UploadsGridModule
  ],
  declarations: [
    FolderContentContainter,
    UploadForm,
    FolderContentPagingNav,
    FolderContentNavBar,
    FolderContentPropertyInfo
  ]
})
export class FolderContentModule { }
