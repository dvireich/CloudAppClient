import { Pipe, PipeTransform } from '@angular/core';
import { folderContentType } from './folderContentType';

@Pipe({
  name: 'convertTofolderContentType'
})
export class ConvertTofolderContentTypePipe implements PipeTransform {

  transform(value: string): folderContentType {
    if(value === "folder"){
        return folderContentType.folder;
    }
    if(value === "file"){
        return folderContentType.file;
    }

    throw new Error("The value: " + value + " is not convertable to folderContentType!");
  }
}