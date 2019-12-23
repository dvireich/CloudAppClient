import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import xml2js from "xml2js";
import { FolderContentFileParserHelper } from "./folder-content-file-parser-helper";
import { AuthenticationService } from "../authentication-service/authentication-service";
import { IUploadData } from "../../Model/IUploadData";
import { UploadData } from "../../Model/UploadData";
import { folderContentType } from "../../Model/folderContentType";
import { sortType } from "../../Model/sortType";
import { IFolder } from "../../Model/IFolder";
import { FolderContent } from "../../Model/FolderContent";
import { IFolderContent } from "../../Model/IFolderContent";
import { IFile } from "../../Model/IFile";
import { FolderObj } from "../../Model/FolderObj";
import { FileObj } from "../../Model/FileObj";

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
  private rquestIdToProgress: Map<string, IUploadData> = new Map<string, IUploadData>();
  private subscribersChangeInUploadProgressToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersCreateUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersFinishUploadToAction: Map<object, () => void> = new Map<object, () => void>();
  private subscribersPageChangedToAction: Map<object, (page: number) => void> = new Map<object, (page: number) => void>();

  initializeFolderContentUrl(id: string) {
    this.FolderContentRepositoryUrl = `http://localhost/CloudAppServer/${id}/FolderContent`;
    // this.FolderContentRepositoryUrl = `http://d-drive.ddns.net/CloudAppServer/${id}/FolderContent`;
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

  splitString(string, size, multiline) {
    let matchAllToken = (multiline == true) ? '[^]' : '.';
    let re = new RegExp(matchAllToken + '{1,' + size + '}', 'g');
    let result = string.match(re);
    return result === null ? [''] : result;
  }

  substringFirstCommnaFormString(value: string): string {
    if (value === "data:") return '';
    const firstComma = value.indexOf(',');
    return value.substring(firstComma + 1);
  }

  pingToServer() {
    const pingUrl = `${this.FolderContentRepositoryUrl}/ping`;
    return this.http.get<boolean>(pingUrl);
  }

  createFile(
    fileName: string,
    path: string,
    fileType: string,
    size: number,
    file: any,
    cont: () => void,
    onError: (message: string) => void) {
    const uploadData = new UploadData(fileName, path, 0);
    const requestId = `${path}_${fileName}`;
    this.rquestIdToProgress.set(requestId, uploadData);
    this.onCreateUpload();
    const createFileUrl = `${this.FolderContentRepositoryUrl}/CreateFile`;

    const onUploadError = (message: string) => {
      onError(message);
      this.clearUpload(fileName, path);
    };

    const onUploadFinish = () => {
      this.finishUpload(fileName, path);

      const uploadData = this.rquestIdToProgress.get(requestId);

      if (uploadData !== null && uploadData !== undefined) {
        uploadData.progress = 100;
        this.onUploadProgressUpdate();
      }
      this.onFinishUpload();
      cont();
    };

    this.http.post(createFileUrl, {
      Name: fileName,
      Path: path,
      FileType: fileType,
      NewValue: '',
      Size: size,
      Sent: 0
    }).pipe(catchError(this.handleErrorWithErrorHandler(onUploadError))).subscribe(data => {
      const onRead = this.updateFile(requestId, fileName, path, fileType, file, onUploadError);
      this.folderContentFileHelper.parseFile(file, onRead, onUploadFinish, onUploadError);
    },
      error => {
        onUploadError(error);
      });
  }

  private updateFile(requestId: string , fileName: string, path: string, fileType: string, file: any, onError: (message: string) => void) {
    // Return a callback for the file parser helper to perform when parser read another chunk of data
    return (parserResult: string, readSoFar: number, cont: () => void) => {
      const uploadData = this.rquestIdToProgress.get(requestId);

      if (uploadData === null || uploadData === undefined) { return; }

      uploadData.progress = readSoFar > 0 ? Math.floor((readSoFar / file.size) * 100) : 100;
      this.onUploadProgressUpdate();

      const updateFileUrl = `${this.FolderContentRepositoryUrl}/UpdateFileContent`;
      this.http.post(updateFileUrl, {
        Name: fileName,
        Path: path,
        FileType: fileType,
        NewValue: this.substringFirstCommnaFormString(parserResult),
        Sent: readSoFar,
        Size: file.size
      }).pipe(catchError(this.handleErrorWithErrorHandler(onError))).subscribe(data => {
        cont();
      },
        error => onError(error));
    };
  }

  clearUpload(fileName: string, path: string): void {
    const clearUploadUrl = `${this.FolderContentRepositoryUrl}/ClearUpload`;
    const requestId = `${path}_${fileName}`;
    this.http.post(clearUploadUrl, {
      Name: fileName,
      Path: path
    }).pipe(
      catchError(this.handleError)
    ).subscribe(data => {
      this.rquestIdToProgress.delete(requestId);
      this.onCreateUpload();
    });
  }

  finishUpload(fileName: string, path: string): void {
    const clearUploadUrl = `${this.FolderContentRepositoryUrl}/FinishUpload`;
    const requestId = `${path}_${fileName}`;
    this.http.post(clearUploadUrl, {
      Name: fileName,
      Path: path
    }).pipe(
      catchError(this.handleError)
    ).subscribe(data => {
      this.rquestIdToProgress.delete(requestId);
    });
  }

  cancelUpload(fileName: string, path: string): void {
    const cancelUploadUrl = `${this.FolderContentRepositoryUrl}/CancelUpload`;
    const requestId = `${path}_${fileName}`;
    this.rquestIdToProgress.delete(requestId);

    this.http.post(cancelUploadUrl, {
      Name: fileName,
      Path: path
    }).pipe(
      catchError(this.handleError)
    ).subscribe(data => {
      this.onCreateUpload();
    });
  }


  deleteFolder(name: string, path: string, page: number) {
    const deleteFolderUrl = `${this.FolderContentRepositoryUrl}/DeleteFolder`;
    return this.http.post(deleteFolderUrl, { Name: name, Path: path, Type: 1, Page: page }).pipe(
      catchError(this.handleError)
    );
  }

  deleteFile(name: string, path: string, page: number) {
    const deleteFileUrl = `${this.FolderContentRepositoryUrl}/DeleteFile`;
    return this.http.post(deleteFileUrl, { Name: name, Path: path, Type: 0, Page: page }).pipe(
      catchError(this.handleError)
    );
  }

  renameFolderContent(name: string, path: string, type: folderContentType, newName: string) {
    const renameUrl = `${this.FolderContentRepositoryUrl}/Rename`;
    return this.http.post(renameUrl, { Name: name, Path: path, Type: type, NewName: newName }).pipe(
      catchError(this.handleError)
    );
  }

  logout() {
    const logoutUrl = `${this.FolderContentRepositoryUrl}/Logout`;
    this.http.get<string>(logoutUrl).subscribe(logout => logout);
    this.FolderContentRepositoryUrl = null;
    this.authenticationService.deleteFromLocalStorageUserNameAndPassword();
    this.authenticationService.deleteFromSessionStorageUserNameAndPassword();
  }

  UpdateNumberOfPagesForFolder(name: string, path: string, searchMode: boolean): void {
    const numberOfPagesUrl = `${this.FolderContentRepositoryUrl}/GetNumberOfPages`;

    this.http.post(numberOfPagesUrl, { Name: name, Path: path, SearchMode: searchMode }, { responseType: 'text' }).pipe(
      map(xml => {
        let numberOfPages = 1;
        const parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            numberOfPages = +result['long']['_'];
          }
        });
        return numberOfPages;
      }),
      catchError(this.handleError)).subscribe(
        pageNum => {
          if (pageNum < 0) { return; }
          this.onPageChange(pageNum);
        }
      )
  }

  GetSortForFolder(name: string, path: string) {
    const numberOfPagesUrl = `${this.FolderContentRepositoryUrl}/GetSortType`;

    return this.http.post(numberOfPagesUrl, { Name: name, Path: path }, { responseType: 'text' }).pipe(
      map(xml => {
        let sortType: sortType = 0;
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            sortType = +result['int']['_'];
          }
        });
        return sortType;
      }),
      catchError(this.handleError))
  }

  GetNumberOfElementsOnPage(name: string, path: string, searchMode: boolean) {
    let numberOfElementsPerPageUrl = `${this.FolderContentRepositoryUrl}/GetNumberOfElementsOnPage`;

    return this.http.post(numberOfElementsPerPageUrl, { Name: name, Path: path, SearchMode: searchMode }, { responseType: 'text' }).pipe(
      map(xml => {
        let numberOfElementsPerPage: number = 0;
        let parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            numberOfElementsPerPage = +result['int']['_'];
          }
        });
        return numberOfElementsPerPage;
      }),
      catchError(this.handleError))
  }

  updateFolderMetadata(name: string, path: string, sortType: sortType, numOfElementOnPage: number) {
    let updateFolderMetadataUrl = `${this.FolderContentRepositoryUrl}/UpdateFolderMetadata`;
    return this.http.post(updateFolderMetadataUrl,
      {
        Name: name,
        Path: path,
        SortType: sortType,
        NumberOfPagesPerPage: numOfElementOnPage
      }).pipe(
        catchError(this.handleError)
      );
  }

  getFolder(name: string, path: string, page: number): Observable<IFolder> {
    const folderUrl = `${this.FolderContentRepositoryUrl}/GetPage`;
    return this.http.post(folderUrl, { Name: name, Path: path, Page: page }, { responseType: 'text' }).pipe(
      map(xml => {
        let jsonStr = '';
        const parser = new xml2js.Parser();
        parser.parseString(xml, (error, result) => {
          if (error) {
            this.handleError(error);

          } else {
            jsonStr = result['string']['_'];
          }
        });
        const ifolder = <IFolder>JSON.parse(jsonStr);
        if (ifolder.CurrentContentPage === undefined || ifolder.CurrentContentPage === null) {
          ifolder.CurrentContentPage = new Array<FolderContent>();
        }

        ifolder.CurrentContentPage = ifolder.CurrentContentPage.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data), // console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }

  downloadFile(name: string, path: string) {
    this.performOnFileDonwloadLink(name, path, (downloadUrl: string) => window.open(downloadUrl));
  }

  performOnFileDonwloadLink(name: string, path: string, action: (downloadUrl: string) => void) {
    const getFileRequestIdUrl = `${this.FolderContentRepositoryUrl}/GetFile`;
    this.http.post(
      getFileRequestIdUrl,
      { Name: name, Path: path },
      { responseType: 'arraybuffer' }).pipe(
      catchError(this.handleError)).subscribe(
        stream => {
          const blob = new Blob([stream], { type: 'application/octet-stream' , });
          const element = document.createElement('a');
          element.href = URL.createObjectURL(blob);
          element.download = name;
          document.body.appendChild(element);
          element.click();
        }
      );
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
        if (ifolder.CurrentContentPage === undefined || ifolder.CurrentContentPage === null) {
          ifolder.CurrentContentPage = new Array<FolderContent>();
        }

        ifolder.CurrentContentPage = ifolder.CurrentContentPage.map(this.mapToAppropriateFolderContentObj);
        return ifolder;
      }),
      tap(data => data),//console.log('All: ' + JSON.stringify(data))),
      catchError(this.handleError));
  }


  copy(folderContentToCopy: IFolderContent, folderToCopyTo: IFolder) {
    let copyFolderUrl = `${this.FolderContentRepositoryUrl}/Copy`;
    return this.http.post(copyFolderUrl, {
      FolderContentName: folderContentToCopy.Name,
      FolderContentPath: folderContentToCopy.RelativePath,
      FolderContentType: folderContentToCopy.Type,
      CopyToName: folderToCopyTo.Name,
      CopyToPath: folderToCopyTo.RelativePath
    }).pipe(
      catchError(this.handleError)
    );
  }

  createPath(name: string, path: string) {
    return (path === undefined || path === null || path === '') ?
      name :
      `${name}\\${path}`;
  }

  getContainingFolderPathFromPath(path: string): string {
    // base case
    if (path === 'home\\') {
      return ''
    }

    // other cases
    const splitted = path.split('\\');
    const contaningFolderPathArray = splitted.slice(0, splitted.length - 1);
    const contaningFolderPath = contaningFolderPathArray.reduce((prev, currVal) => {
      if (prev === '') {
        return currVal;
      }

      return prev + '\\' + currVal;
    }, "");

    return contaningFolderPath;
  }

  getContainingFolderNameFromPath(path: string): string {
    // base case
    if (path === 'home\\' || path === '') {
      return 'home';
    }

    // other cases
    const splitted = path.split('\\');
    const contaningFolderName = splitted.reverse().shift();
    return contaningFolderName;
  }

  private mapToAppropriateFolderContentObj(element: IFolderContent) {
    const name = element.Name;
    const path = element.RelativePath;
    const type = element.Type;
    const creationTime = element.CreationTime;
    const modificationTime = element.ModificationTime;

    if (type === folderContentType.file) {
      const elementFile = element as IFile;
      const size = +elementFile.Size;
      const sizeInMb = Math.floor(size / (1024 * 1024));
      const file = new FileObj();
      file.Name = name;
      file.RelativePath = path;
      file.CreationTime = creationTime;
      file.ModificationTime = modificationTime;
      file.Size = `${sizeInMb} MB`;
      return file;
    }

    if (type === folderContentType.folder) {
      let folder = new FolderObj();
      let elementFolder = element as IFolder;
      folder.Name = name;
      folder.RelativePath = path;
      folder.CreationTime = creationTime;
      folder.ModificationTime = modificationTime;
      folder.SortType = elementFolder.SortType;
      return folder;
    }
    console.log("Not able to map object: " + name + " " + path + " " + type);
    throw new Error("Not able to map object: " + name + " " + path + " " + type);
  }

  private handleError(err: HttpErrorResponse) {
    console.log(err);
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

  private handleErrorWithErrorHandler(errorHandler: (message: string) => void) {
    return (err: HttpErrorResponse) => {
      console.log(err);
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
      errorHandler(errorMessage);
      return throwError(errorMessage);
    }
  }
}
