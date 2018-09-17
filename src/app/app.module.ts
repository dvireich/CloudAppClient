import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { FolderContentModule } from './FolderContent/folder-content.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'workspace', pathMatch: 'full' },
      { path: '**', redirectTo: 'workspace'}
    ]),
    FolderContentModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
