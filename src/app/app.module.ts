import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ContextmenuComponent } from './Common/contexMenu.component/contextmenu.component';
import { FolderContentContainter } from './FolderContent/folder-content-container.component/folder-content-container.component';
import { SelectableComponent } from './FolderContent/select-able.component/select-able.component';
import { MessageBox } from './Common/messagebox.component/messagebox.component';
import { Inputbox } from './Common/inputbox.component/inputbox.component';


@NgModule({
  declarations: [
    AppComponent,
    SelectableComponent,
    ContextmenuComponent,
    FolderContentContainter,
    MessageBox,
    Inputbox
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
