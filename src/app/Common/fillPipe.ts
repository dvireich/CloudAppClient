import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'fill'
  })
  export class FillPipe implements PipeTransform {
    transform(length: number) {
      let arr = new Array<number>(length);
      for(let i = 0; i < length; i++){
        arr[i] = i+1;
      }
      return arr;
    }
  }