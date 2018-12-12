import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageBox } from './messagebox.component/messagebox.component';
import { Inputbox } from './inputbox.component/inputbox.component';
import { FillPipe } from './fillPipe';
import { PagingNav } from './paging.component/paging.component';
import { TakePipe } from './takePipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavagationBar } from './nav-bar.component/nav-bar.component';
import { Loader } from './loader.component/loader.component';
import { AngularDraggableModule } from 'angular2-draggable';
import { MultiLevelContexMenuModule } from './multi-level-contex-menu/multi-level-contex-menu.module';
import { DragAndDropFilesComponent } from './drag-drop.component/drag-drop.component';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
import { PopupVideo } from './popup-video.component/popup-video.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularDraggableModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  declarations: [
    MessageBox,
    Inputbox,
    NavagationBar,
    FillPipe,
    PagingNav,
    TakePipe,
    Loader,
    DragAndDropFilesComponent,
    PopupVideo
  ],
  exports: [
    MultiLevelContexMenuModule,
    MessageBox,
    Inputbox,
    NavagationBar,
    FillPipe,
    PagingNav,
    TakePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Loader,
    AngularDraggableModule,
    DragAndDropFilesComponent,
    PopupVideo
  ]
})
export class SharedModule { }
