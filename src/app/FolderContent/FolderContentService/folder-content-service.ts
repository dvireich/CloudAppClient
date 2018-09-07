import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { IFolder } from "../IFolder";
import { FolderObj } from "../FolderObj";
import { FileObj } from "../FileObj";
import { folderContentType } from "../folderContentType";
import { IFolderContent } from "../IFolderContent";
import { FolderContent } from "../FolderContent";

@Injectable({
  providedIn: "root"
})
export class FolderContnentService {

  constructor(private http: HttpClient) {
  }

  private FolderContentRepositoryUrl = "http://localhost/CloudAppServer/FolderContent";

  private getReuestId() : Observable<number>{
    let requestIdUrl = `${this.FolderContentRepositoryUrl}/RequestId`;
    return this.http.get<number>(requestIdUrl).pipe(catchError(this.handleError))
  }

  private chunkString(str, length) : string[] {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  }

  createFile(fileName: string, path: string, fileType: string, value: string, cont: ()=> void) {
    return this.getReuestId().subscribe(
      requestId => {
    let createFileUrl = `${this.FolderContentRepositoryUrl}/CreateFile`;
    let chunks = this.chunkString(value, 10000);   
    this.http.post(createFileUrl, { 
      Name: fileName, 
      Path: path, 
      FileType: fileType, 
      NewValue: '', 
      RequestId: requestId,
      NumOfChunks: chunks.length}).subscribe(data => {
        this.updateFile(requestId, fileName, path, fileType, chunks, 0, cont);
      })
  });
}

private updateFile(requestId: number, 
                   fileName: string, 
                   path: string, 
                   fileType: string, 
                   chunks: string[], 
                   index: number,
                   cont: ()=>void){
        
  if(index >= chunks.length) {
    cont();
    return;
  };                  
  let updateFileUrl = `${this.FolderContentRepositoryUrl}/UpdateFileContent`;
  this.http.post(updateFileUrl, { 
    Name: fileName, 
    Path: path, 
    FileType: fileType, 
    NewValue: chunks[index], 
    NewValueIndex: index,
    RequestId: requestId}).subscribe(data => {
      this.updateFile(requestId, fileName, path, fileType, chunks, index + 1, cont);
    })
}


  deleteFolder(name: string, path: string) {
    let deleteFolderUrl = `${this.FolderContentRepositoryUrl}/DeleteFolder`;
    return this.http.post(deleteFolderUrl, { Name: name, Path: path, Type: 1 }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(name: string, path: string) {
    let deleteFileUrl = `${this.FolderContentRepositoryUrl}/DeleteFile`;
    return this.http.post(deleteFileUrl, { Name: name, Path: path, Type: 0 }).pipe(
      catchError(this.handleError)
    );
  }

  renameFolderContent(name: string, path: string, type: folderContentType, newName: string) {
    let renameUrl = `${this.FolderContentRepositoryUrl}/Rename`;
    return this.http.post(renameUrl, { Name: name, Path: path, Type: type, NewName: newName }).pipe(
      catchError(this.handleError)
    );
  }

  getFolder(name: string, path: string): Observable<IFolder> {
    path = this.fixPath(path);
    let folderUrl = `${this.FolderContentRepositoryUrl}/name="${name}"&path="${path}"`;
    return this.http.get<string>(folderUrl).pipe(
      map(jsonStr => {
        let ifolder = <IFolder>JSON.parse(jsonStr);
        if (ifolder.Content === undefined || ifolder.Content === null) {
          ifolder.Content = new Array<FolderContent>();
        }

        ifolder.Content = ifolder.Content.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data),//console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  fixPath(path: string): string {
    return path.replace(new RegExp('/', 'g'), ',');
  }

  createFolder(name: string, path: string) {
    let createFolderUrl = `${this.FolderContentRepositoryUrl}/CreateFolder`;
    return this.http.post(createFolderUrl, { Name: name, Path: path }).pipe(
      catchError(this.handleError)
    );
  }

  copy(folderContentToCopy: IFolderContent, folderToCopyTo: IFolder) {
    let copyFolderUrl = `${this.FolderContentRepositoryUrl}/Copy`;
    return this.http.post(copyFolderUrl, {
      FolderContentName: folderContentToCopy.Name,
      FolderContentPath: folderContentToCopy.Path,
      FolderContentType: folderContentToCopy.Type,
      CopyToName: folderToCopyTo.Name,
      CopyToPath: folderToCopyTo.Path
    }).pipe(
      catchError(this.handleError)
    );
  }

  createPath(name: string, path: string) {
    return (path === undefined || path === null || path === '') ?
      name :
      `${name}/${path}`;
  }

  getContaningFolderPathFromPath(path: string): string {
    //base case
    if (path === 'home/') return 'home/';
    //other cases
    let splitted = path.split('/');
    let contaningFolderPathArray = splitted.slice(0, splitted.length - 1);
    let contaningFolderPath = contaningFolderPathArray.reduce((prev, currVal) => prev + '/' + currVal, "");
    return contaningFolderPath;
  }

  getContaningFolderNameFromPath(path: string): string {
    //base case
    if (path === 'home/' || path === '') return 'home';
    //other cases
    let splitted = path.split('/');
    let contaningFolderName = splitted.reverse().shift();
    return contaningFolderName;
  }
  private mapToAppropriateFolderContentObj(element: IFolderContent) {
    let name = element.Name;
    let path = element.Path;
    let type = element.Type;

    if (type === folderContentType.file) {
      let file = new FileObj();
      file.Name = name;
      file.Path = path;
      return file;
    }

    if (type === folderContentType.folder) {
      let folder = new FolderObj();
      folder.Name = name;
      folder.Path = path;
      return folder;
    }
    console.log("Not able to map object: " + name + " " + path + " " + type);
    throw new Error("Not able to map object: " + name + " " + path + " " + type);
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
