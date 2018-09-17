import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextmenuComponent } from './contexMenu.component/contextmenu.component';
import { MessageBox } from './messagebox.component/messagebox.component';
import { NavagationBar } from './navBar.component/nav-bar.component';
import { Inputbox } from './inputbox.component/inputbox.component';
import { UploadProgress } from './uploadProgress.component/uploadProgress.component';
import { FillPipe } from './fillPipe';
import { PagingNav } from './paging.component/paging.component';
import { TakePipe } from './takePipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ContextmenuComponent,
    MessageBox,
    Inputbox,
    NavagationBar,
    UploadProgress,
    FillPipe,
    PagingNav,
    TakePipe
  ],
  exports: [
    ContextmenuComponent,
    MessageBox,
    Inputbox,
    NavagationBar,
    UploadProgress,
    FillPipe,
    PagingNav,
    TakePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
