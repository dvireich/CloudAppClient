import { NgModule } from '@angular/core';
import { FolderContentContainter } from './folder-content-container.component/folder-content-container.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../Common/common.module';
import { SelectableGridModule } from './selectable-grid/selectable-grid.module';
import { UploadsGridModule } from './uploads-grid/uploads-grid.module';
import { UploadForm } from './upload-form.component/upload-form.component';
import { FolderContentPagingNav } from './folder-content-paging.component/folder-content-paging.component';
import { FolderContentPropertyInfo } from './folder-content-property-info/folder-content-property-info';
import { FolderContentNavBarPathBreak } from './folder-content-nav-bar-path-break/folder-content-nav-bar-path-break';
import { FolderContentNavBar } from './folder-content-nav-bar/folder-content-nav-bar';
import { LoginModule } from './login/login-module';


@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'workspace', component: FolderContentContainter}
    ]),
    SharedModule,
    SelectableGridModule,
    UploadsGridModule,
    LoginModule
  ],
  declarations: [
    FolderContentContainter,
    UploadForm,
    FolderContentPagingNav,
    FolderContentNavBarPathBreak,
    FolderContentPropertyInfo,
    FolderContentNavBar
  ]
})
export class FolderContentModule { }
