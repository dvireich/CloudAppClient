import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ContextmenuComponent } from './Common/contexMenu.component/contextmenu.component';
import { FolderContentContainter } from './FolderContent/folder-content-container.component/folder-content-container.component';
import { SelectableComponent } from './FolderContent/select-able.component/select-able.component';
import { Inputbox } from './Common/inputbox.component/inputbox.component';


@NgModule({
  declarations: [
    AppComponent,
    SelectableComponent,
    ContextmenuComponent,
    FolderContentContainter,
    Inputbox
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
