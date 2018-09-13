import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'take'
  })
  export class TakePipe implements PipeTransform {
    transform(array: object[], numberToTake: number) {
      return array.slice(0, numberToTake);
    }
  }