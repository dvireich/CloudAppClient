import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageBox } from './messagebox.component/messagebox.component';
import { Inputbox } from './inputbox.component/inputbox.component';
import { FillPipe } from './fillPipe';
import { PagingNav } from './paging.component/paging.component';
import { TakePipe } from './takePipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextmenuComponent } from './contex-menu.component/context-menu.component';
import { NavagationBar } from './nav-bar.component/nav-bar.component';

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
    FillPipe,
    PagingNav,
    TakePipe
  ],
  exports: [
    ContextmenuComponent,
    MessageBox,
    Inputbox,
    NavagationBar,
    FillPipe,
    PagingNav,
    TakePipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
