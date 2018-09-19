import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectableComponent } from './selectalbe-grid.component/select-able.component/select-able.component';
import { SelectableGrid } from './selectalbe-grid.component/selectalbe-grid.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SelectableComponent,
    SelectableGrid
  ],
  exports: [
    SelectableGrid
  ]
})
export class SelectableGridModule { }
