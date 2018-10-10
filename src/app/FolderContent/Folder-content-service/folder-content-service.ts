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
import { IFile } from "../Model/IFile";
import { IUploadData } from "../Model/IUploadData";
import { UploadData } from "../Model/UploadData";
import { FolderContentFileParserHelper } from "./folder-content-file-parser-helper";
import { AuthenticationService } from "../authentication-service/authentication-service";

@Injectable({
  providedIn: "root"
})
export class FolderContnentService {

  constructor(
    private http: HttpClient, 
    private folderContentFileHelper: FolderContentFileParserHelper, 
    private authenticationService: AuthenticationService) {
  }

  private FolderContentRepositoryUrl: string = null;
  private rquestIdToProgress: Map<number, IUploadData> = new Map<number, IUploadData>();
  private subscribersChangeInUploadProgressToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersCreateUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersFinishUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersPageChangedToAction: Map<object, (page: number) => void> = new Map<object, (page: number) => void>();

  initializeFolderContentUrl(id: string) {
    // this.FolderContentRepositoryUrl = `http://localhost/CloudAppServer/${id}/FolderContent`;
    this.FolderContentRepositoryUrl = `http://d-drive.ddns.net/CloudAppServer/${id}/FolderContent`;
  }

  isInitialized(): boolean {
    return this.FolderContentRepositoryUrl !== null && this.FolderContentRepositoryUrl !== undefined;
  }
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
    let result = string.match(re);
    return result === null ? [''] : result;
  }

  substringFirstCommnaFormString(value: string): string {
    if (value === "data:") return '';
    let firstComma = value.indexOf(',');
    return value.substring(firstComma + 1);
  }

  pingToServer() {
    let pingUrl = `${this.FolderContentRepositoryUrl}/ping`
    return this.http.get<boolean>(pingUrl);
  }

  createFile(fileName: string, path: string, fileType: string, value: string, size: number, file: any, cont: () => void, onError: (message: string) => void) {
    return this.getReuestId().pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(
      requestId => {
        let uploadData = new UploadData(fileName, requestId, 0);
        this.rquestIdToProgress.set(requestId, uploadData);
        this.onCreateUpload();
        let createFileUrl = `${this.FolderContentRepositoryUrl}/CreateFile`;
        this.http.post(createFileUrl, {
          Name: fileName,
          Path: path,
          FileType: fileType,
          NewValue: '',
          RequestId: requestId,
          Size: size,
          Sent: 0
        }).pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(data => {
          let onUploadFinish = this.onUploadFinish(requestId, cont);
          let onUploadError = onError;
          let onRead = this.updateFile(requestId, fileName, path, fileType, file, onError);
          this.folderContentFileHelper.parseFile(file, onRead, onUploadFinish, onUploadError);
        },
          error =>{
            onError(error);
            this.clearUpload(requestId);
          }) 
      },
      error => onError(error));
  }

  private onUploadFinish(requestId: number, cont: () => void) {
    //Return a callback for the file parser helper to perform when upload is finish
    return () => {
      let uploadData = this.rquestIdToProgress.get(requestId);
      if (uploadData !== null && uploadData !== undefined) {
        uploadData.progress = 100;
        this.onUploadProgressUpdate();
      }
      this.onFinishUpload()
      cont();
    }
  }
  private updateFile(requestId: number, fileName: string, path: string, fileType: string, file: any, onError: (message: string) => void) {
    //Return a callback for the file parser helper to perform when parser read another chunk of data
    return (parserResult: string, readSoFar: number, cont: () => void) => {
      let uploadData = this.rquestIdToProgress.get(requestId);
      if (uploadData === null || uploadData === undefined) return;

      uploadData.progress = readSoFar > 0 ? Math.floor((readSoFar / file.size) * 100) : 100;
      this.onUploadProgressUpdate();

      let updateFileUrl = `${this.FolderContentRepositoryUrl}/UpdateFileContent`;
      this.http.post(updateFileUrl, {
        Name: fileName,
        Path: path,
        FileType: fileType,
        NewValue: this.substringFirstCommnaFormString(parserResult),
        RequestId: requestId,
        Sent: readSoFar,
        Size: file.size
      }).pipe(catchError(this.hanldeErrorWithErrorHandler(onError))).subscribe(data => {
        cont()
      },
        error => onError(error))
    }
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

  logout() {
    let logoutUrl = `${this.FolderContentRepositoryUrl}/Logout`;
    this.http.get<string>(logoutUrl).subscribe(logout => logout);
    this.FolderContentRepositoryUrl = null;
    this.authenticationService.deleteFromLocalStorageUserNameAndPassword();
    this.authenticationService.deleteFromSessionStorageUserNameAndPassword();
  }

  UpdateNumberOfPagesForFolder(name: string, path: string): void {
    path = this.fixPath(path);
    let numberOfPagesUrl = `${this.FolderContentRepositoryUrl}/GetNumberOfPages`;

    this.http.post(numberOfPagesUrl, { Name: name, Path: path }, { responseType: 'text' }).pipe(
      map(xml => {
        let numberOfPages = 1;
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            numberOfPages = +result['int']['_'];
          }
        });
        return numberOfPages;
      }),
      catchError(this.handleError)).subscribe(
        pageNum => {
          if (pageNum < 0) return;
          this.onPageChange(pageNum)
        }
      )
  }

  getFolder(name: string, path: string, page: number): Observable<IFolder> {
    path = this.fixPath(path);
    let folderUrl = `${this.FolderContentRepositoryUrl}/GetPage`;
    return this.http.post(folderUrl, { Name: name, Path: path, Page: page }, { responseType: 'text' }).pipe(
      map(xml => {
        let jsonStr = "";
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            jsonStr = result['string']['_'];
          }
        });
        let ifolder = <IFolder>JSON.parse(jsonStr);
        if (ifolder.Content === undefined || ifolder.Content === null) {
          ifolder.Content = new Array<FolderContent>();
        }

        ifolder.Content = ifolder.Content.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data),//console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }

  downloadFile(name: string, path: string) {
    path = this.fixPath(path)
    let getFileRequestIdUrl = `${this.FolderContentRepositoryUrl}/GetFileRequestId`;
    this.http.post(getFileRequestIdUrl, { Name: name, Path: path }, { responseType: 'text' }).pipe(
      map(xml => {
        let requestId = -1;
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            requestId = +result['int']['_'];
          }
        });
        return requestId;
      }),
      catchError(this.handleError)).subscribe(
        requestId => {
          if (requestId < 0) return;
          let downloadFileUrl = `${this.FolderContentRepositoryUrl}/GetFile/requestId="${requestId}"`;
          window.open(downloadFileUrl);
        }
      )
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

  search(name: string, page: number): Observable<IFolder> {
    let searchUrl = `${this.FolderContentRepositoryUrl}/Search`;
    return this.http.post(searchUrl, { Name: name, Page: page }, { responseType: 'text' }).pipe(
      map(xml => {
        let jsonStr = "";
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            jsonStr = result['string']['_'];
          }
        });
        let ifolder = <IFolder>JSON.parse(jsonStr);
        if (ifolder.Content === undefined || ifolder.Content === null) {
          ifolder.Content = new Array<FolderContent>();
        }

        ifolder.Content = ifolder.Content.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data),//console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
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
      parser.parseString(err.error, (error, result) => {
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
        parser.parseString(err.error, (error, result) => {
          if (error) {

            errorMessage = err.error;
            // errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

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
