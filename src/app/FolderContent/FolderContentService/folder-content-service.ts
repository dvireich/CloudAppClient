import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import xml2js from "xml2js";


import { IFolder } from "../Model/IFolder";
import { FolderObj } from "../Model/FolderObj";
import { FileObj } from "../Model/FileObj";
import { folderContentType } from "../Model/folderContentType";
import { IFolderContent } from "../Model/IFolderContent";
import { FolderContent } from "../Model/FolderContent";
import { IUploadData } from "../../Common/uploadProgress.component/IuploadData";
import { UploadData } from "../../Common/uploadProgress.component/UploadData";
import { IFile } from "../Model/IFile";

@Injectable({
  providedIn: "root"
})
export class FolderContnentService {

  constructor(private http: HttpClient) {
  }

  private FolderContentRepositoryUrl = "http://localhost/CloudAppServer/FolderContent";
  private rquestIdToProgress: Map<number, IUploadData> = new Map<number, IUploadData>();
  private subscribersChangeInUploadProgressToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersCreateUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersFinishUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersPageChangedToAction: Map<object, (page: number) => void> = new Map<object, (page: number) => void>();

  getUploadProgress(): IUploadData[] {
    return Array.from(this.rquestIdToProgress.values());
  }

  private onFinishUpload() {
    Array.from(this.subscribersFinishUploadToAction.values()).forEach(onFinishUploadAction => {
      onFinishUploadAction()
    });
  }
  private onCreateUpload() {
    Array.from(this.subscribersCreateUploadToAction.values()).forEach(onCreateUploadAction => {
      onCreateUploadAction()
    });
  }

  private onPageChange(page: number) {
    Array.from(this.subscribersPageChangedToAction.values()).forEach(onPageChangedAction => {
      onPageChangedAction(page)
    });
  }

  subscriberToCreateUploadToAction(subscriber: object, onChange: () => void) {
    this.subscribersCreateUploadToAction.set(subscriber, onChange);
  }

  subscriberToPageChangedToAction(subscriber: object, onChange: (page: number) => void) {
    this.subscribersPageChangedToAction.set(subscriber, onChange);
  }

  removeSubscriberToPageChangedToAction(subscriber: object) {
    this.subscribersPageChangedToAction.delete(subscriber);
  }

  removeSubscriberToCreateUploadToAction(subscriber: object) {
    this.subscribersCreateUploadToAction.delete(subscriber);
  }
  subscriberToFinishUploadToAction(subscriber: object, onChange: () => void) {
    this.subscribersFinishUploadToAction.set(subscriber, onChange);
  }

  removeSubscriberToFinishUploadToAction(subscriber: object) {
    this.subscribersFinishUploadToAction.delete(subscriber);
  }

  private onUploadProgressUpdate() {
    Array.from(this.subscribersChangeInUploadProgressToAction.values()).forEach(onUploadProgressAction => {
      onUploadProgressAction()
    });
  }

  subscribeToChangeInUploadProgress(subscriber: object, onChange: () => void) {
    this.subscribersChangeInUploadProgressToAction.set(subscriber, onChange);
  }

  removeSubscribeToChangeInUploadProgress(subscriber: object) {
    this.subscribersChangeInUploadProgressToAction.delete(subscriber);
  }

  private getReuestId(): Observable<number> {
    let requestIdUrl = `${this.FolderContentRepositoryUrl}/RequestId`;
    return this.http.get<number>(requestIdUrl).pipe(catchError(this.handleError))
  }

  splitString(string, size, multiline) {
    var matchAllToken = (multiline == true) ? '[^]' : '.';
    var re = new RegExp(matchAllToken + '{1,' + size + '}', 'g');
    let result =  string.match(re);
    return result === null ? [''] : result;
  }

  substringFirstCommnaFormString(value: string) : string{
    if(value === "data:") return '';
    let firstComma = value.indexOf(',');
    return value.substring(firstComma + 1);
  }

  createFile(fileName: string, path: string, fileType: string, value: string, size: number, cont: () => void, onError: (message: string) => void) {
    return this.getReuestId().pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(
      requestId => {
        let uploadData = new UploadData(fileName, requestId, 0);
        this.rquestIdToProgress.set(requestId, uploadData);
        this.onCreateUpload();
        let createFileUrl = `${this.FolderContentRepositoryUrl}/CreateFile`;
        let chunks = this.splitString(this.substringFirstCommnaFormString(value) , Math.pow(4, 7) , true);
        this.http.post(createFileUrl, {
          Name: fileName,
          Path: path,
          FileType: fileType,
          NewValue: '',
          RequestId: requestId,
          NumOfChunks: chunks.length,
          Size: size
        }).pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(data => {
          this.updateFile(requestId, fileName, path, fileType, chunks, 0, cont, onError)
        },
          error => onError(error))
      },
      error => onError(error));
  }

  clearUpload(requestId: number): void {
    let clearUploadUrl = `${this.FolderContentRepositoryUrl}/ClearUpload`;
    this.http.post(clearUploadUrl, requestId).pipe(
      catchError(this.handleError)
    ).subscribe(data => {
      this.rquestIdToProgress.delete(requestId);
      this.onCreateUpload();
    });
  }
  
  private updateFile(requestId: number,
    fileName: string,
    path: string,
    fileType: string,
    chunks: string[],
    index: number,
    cont: () => void,
    onError: (message: string) => void) {

    let uploadData = this.rquestIdToProgress.get(requestId);
    if (uploadData === null || uploadData === undefined) return;

    uploadData.progress = chunks.length > 0 ? Math.floor((index / chunks.length) * 100): 100;
    this.onUploadProgressUpdate();
    if (index >= chunks.length) {
      this.onFinishUpload()
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
      RequestId: requestId
    }).pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(data => {
      this.updateFile(requestId, fileName, path, fileType, chunks, index + 1, cont, onError);
    },
      error => onError(error))
  }


  deleteFolder(name: string, path: string, page: number) {
    let deleteFolderUrl = `${this.FolderContentRepositoryUrl}/DeleteFolder`;
    return this.http.post(deleteFolderUrl, { Name: name, Path: path, Type: 1, Page: page }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(name: string, path: string, page: number) {
    let deleteFileUrl = `${this.FolderContentRepositoryUrl}/DeleteFile`;
    return this.http.post(deleteFileUrl, { Name: name, Path: path, Type: 0, Page: page }).pipe(
      catchError(this.handleError)
    );
  }

  renameFolderContent(name: string, path: string, type: folderContentType, newName: string) {
    let renameUrl = `${this.FolderContentRepositoryUrl}/Rename`;
    return this.http.post(renameUrl, { Name: name, Path: path, Type: type, NewName: newName }).pipe(
      catchError(this.handleError)
    );
  }

  UpdateNumberOfPagesForFolder(name: string, path: string) : void{
    path = this.fixPath(path);
    let numberOfPagesUrl = `${this.FolderContentRepositoryUrl}/NumberOfPages/name="${name}"&path="${path}"`;
    this.http.get<number>(numberOfPagesUrl).pipe(catchError(this.handleError)).subscribe(
      pageNum => this.onPageChange(pageNum));
  }

  getFolder(name: string, path: string, page: number): Observable<IFolder> {
    path = this.fixPath(path);
    let folderUrl = `${this.FolderContentRepositoryUrl}/name="${name}"&path="${path}"&page=${page}`;
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

  downloadFile(name: string, path: string){
    path = this.fixPath(path)
    let downloadFileUrl = `${this.FolderContentRepositoryUrl}/GetFile/name="${name}"&path="${path}"`;
    window.open(downloadFileUrl);
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
    if (path === 'home/') return '';
    //other cases
    let splitted = path.split('/');
    let contaningFolderPathArray = splitted.slice(0, splitted.length - 1);
    let contaningFolderPath = contaningFolderPathArray.reduce((prev, currVal) => {
      if (prev === '') {
        return currVal;
      }
      return prev + '/' + currVal;
    }, "");
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
    let creationTime = element.CreationTime;
    let modificationTime = element.ModificationTime;

    if (type === folderContentType.file) {
      let elementFile = element as IFile;
      let size = +elementFile.Size;
      console.log(size);
      let sizeInMb = Math.floor(size / (1024 * 1024));
      let file = new FileObj();
      file.Name = name;
      file.Path = path;
      file.CreationTime = creationTime;
      file.ModificationTime = modificationTime;
      file.Size = `${sizeInMb} MB`;
      return file;
    }

    if (type === folderContentType.folder) {
      let folder = new FolderObj();
      folder.Name = name;
      folder.Path = path;
      folder.CreationTime = creationTime;
      folder.ModificationTime = modificationTime;
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
      var parser = new xml2js.Parser();
      parser.parseString(err.error,(error, result) => {
          if (error) {
            errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
          } else {
            errorMessage = result['string']['_'];
          }
    });
  }
    console.error("handleError " + errorMessage);
    return throwError(errorMessage);
  }

  private hanldeErrorWithErrorHandler(errorHanlder: (message: string) => void) {
    return (err: HttpErrorResponse) => {
      let errorMessage = '';
      if (err.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        errorMessage = `An error occurred: ${err.error.message}`;
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        var parser = new xml2js.Parser();
        parser.parseString(err.error,(error, result) => {
            if (error) {
              errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
            } else {
              errorMessage = result['string']['_'];
            }
      });
      }
      console.error("hanldeErrorWithErrorHandler " + errorMessage);
      errorHanlder(errorMessage);
      return throwError(errorMessage);
    }
  }
}
