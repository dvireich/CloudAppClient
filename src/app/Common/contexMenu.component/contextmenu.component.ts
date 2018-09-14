import { Component, Input} from '@angular/core';
import { IContexMentuItem } from './IcontexMentuItem';

@Component({
  selector: 'app-contextmenu',
  templateUrl: './contextmenu.Component.html',
  styleUrls: ['./contextmenu.Component.css']
})
export class ContextmenuComponent{
    
  
  @Input() x: number =0;
  @Input() y: number =0;

  @Input() contexMentuItems : IContexMentuItem[];

  private isLast(item: IContexMentuItem) : boolean{
    console.log(item.name + " " + (this.contexMentuItems[0].name === item.name));
    return this.contexMentuItems === undefined ? 
    true : 
    this.contexMentuItems[this.contexMentuItems.length-1].name === item.name;
  }
}