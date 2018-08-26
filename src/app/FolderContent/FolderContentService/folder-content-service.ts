import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { IFolder } from "../IFolder";
import { FolderObj } from "../FolderObj";
import { FileObj } from "../FileObj";
import { folderContentType } from "../folderContentType";
import { IFolderContent } from "../IFolderContent";

@Injectable({
  providedIn: "root"
})
export class FolderContnentService {

  constructor(private http: HttpClient) {
  }

  //private FolderContentRepositoryUrl = "api/folder-content/";
  private FolderContentRepositoryUrl = "http://localhost/CloudAppServer/FolderContent";

  deleteFolder(name: string, path: string){
    let folderUrl = `${this.FolderContentRepositoryUrl}/DeleteFolder`;
    return this.http.post(folderUrl, {Name: name, Path: path, Type: 1});
  }

  getFolder(name: string, path: string): Observable<IFolder> {
    path = this.fixPath(path);
    let folderUrl = `${this.FolderContentRepositoryUrl}/name=${name}&path=${path}`;

    return this.http.get<string>(folderUrl).pipe(
      map(jsonStr => {
        let ifolder = <IFolder>JSON.parse(jsonStr);
        ifolder.Content = ifolder.Content.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data), //console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  fixPath(path: string): string {
    if(path === undefined || path === ''){
      return '""';
    }

    return path;
  }

  createFolder(name: string, path: string) {
    let folderUrl = `${this.FolderContentRepositoryUrl}/CreateFolder`;
    return this.http.post(folderUrl, {Name: name, Path: path});
  }

  getContaningFolderPathFromPath(path: string): string {
    //base case
    if(path === 'home/') return 'home/';
    //other cases
    let splitted = path.split('/');
    let contaningFolderPathArray = splitted.slice(0, splitted.length -1);
    let contaningFolderPath = contaningFolderPathArray.reduce((prev, currVal) => prev + '/' + currVal, "");
    return contaningFolderPath;
  }

  getContaningFolderNameFromPath(path: string): string {
    //base case
    if(path === 'home/') return 'root';
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
