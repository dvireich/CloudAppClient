import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiLevelContexMenu } from './multi-level-contex-menu.component/multi-level-contex-menu.component';
import { ContextmenuComponent } from './contex-menu.component/context-menu.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    MultiLevelContexMenu,
    ContextmenuComponent
  ],
  exports:[
    MultiLevelContexMenu
  ]
})
export class MultiLevelContexMenuModule { }
