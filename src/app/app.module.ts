import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms";
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ContextmenuComponent } from './Common/contexMenu.component/contextmenu.component';
import { FolderContentContainter } from './FolderContent/folder-content-container.component/folder-content-container.component';
import { SelectableComponent } from './FolderContent/select-able.component/select-able.component';
import { MessageBox } from './Common/messagebox.component/messagebox.component';
import { Inputbox } from './Common/inputbox.component/inputbox.component';
import { NavagationBar } from './Common/navBar.component/nav-bar.component';
import { Base64UploadComponent } from './Common/uploadForm.component/uploadForm.component';
import { UploadProgress } from './Common/uploadProgress.component/uploadProgress.component';
import { UploadProgressContainer } from './FolderContent/upload-progress-container.component/upload-progress-container.component';
import { FillPipe } from './Common/fillPipe';
import { FolderContentPagingNav } from './FolderContent/folderContent-Paging.component/folderContent-Paging.component';
import { PagingNav } from './Common/paging.component/paging.component';
import { TakePipe } from './Common/takePipe';


@NgModule({
  declarations: [
    AppComponent,
    SelectableComponent,
    ContextmenuComponent,
    FolderContentContainter,
    MessageBox,
    Inputbox,
    NavagationBar,
    Base64UploadComponent,
    UploadProgress,
    UploadProgressContainer,
    FillPipe,
    FolderContentPagingNav,
    PagingNav,
    TakePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: 'workspace', component: FolderContentContainter },
      { path: 'uploadprogress', component: UploadProgressContainer },
      { path: '', redirectTo: 'workspace', pathMatch: 'full' },
      { path: '**', redirectTo: 'www'}
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
