import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
  })
export class FolderContentFileParserHelper{

    public parseFile(
        file, 
        onReadCallback: (readResult: string, readCount: number, cont: ()=> void) => void,
        onFinishCallback: ()=> void, 
        onErrorCallbck:(error)=> void) {

        var fileSize = file.size;
        var chunkSize = Math.pow(4, 7); // bytes
        var offset = 0;
        var self = this; // we need a reference to the current object
        var chunkReaderBlock = null;
    
        var readEventHandler = function (evt) {
          if (evt.target.error == null) {
            // offset += evt.target.result.length;
            offset += chunkSize;
            // callback for handling read chunk
            onReadCallback(evt.target.result, offset, ()=> {
              if (offset >= fileSize) {
                console.log("Done reading file");
                onFinishCallback();
                return;
              }
              chunkReaderBlock(offset , chunkSize, file);
            }); 
          } else {
            console.log("Read error: " + evt.target.error);
            onErrorCallbck(evt.target.error);
            return;
          }
        }
    
        chunkReaderBlock = function (_offset, length, _file) {
          var r = new FileReader();
          var blob = _file.slice(_offset, length + _offset);
          r.onload = readEventHandler;
          r.readAsDataURL(blob);
        }
    
        // now let's start the read with the first block
        chunkReaderBlock(offset, chunkSize, file);
      }


}