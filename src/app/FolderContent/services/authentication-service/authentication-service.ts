import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import xml2js from "xml2js";
import { catchError, tap, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  private folderContentAuthenticationUrl = "http://localhost/CloudAppServer/Authentication";
  //private folderContentAuthenticationUrl = "http://d-drive.ddns.net/CloudAppServer/Authentication";

  constructor(private http: HttpClient) {
  }
  registerUser(name: string, password: string, recoveryQuestion: string, recoveryAnswer: string,  onError: (message: string) => void) {
    let authenticationRegisterUrl = `${this.folderContentAuthenticationUrl}/Register`;
    return this.http.post(authenticationRegisterUrl, { UserName: name, Password: password, SecurityQuestion: recoveryQuestion, SecurityAnswer: recoveryAnswer }).pipe(catchError(this.handleErrorWithErrorHandler(onError)));
  }

  login(userName: string, password: string, onError: (message: string) => void) {
    let authenticateUrl = `${this.folderContentAuthenticationUrl}/Authenticate/username=${userName}&password=${password}`;
    return this.http.get<string>(authenticateUrl).pipe(catchError(this.handleErrorWithErrorHandler(onError)));
  }

  getSecurityQuestion(userName: string) : Observable<string>{
    let securityQuestionUrl = `${this.folderContentAuthenticationUrl}/Authenticate/SecurityQuestion/username=${userName}`;
    return this.http.get<string>(securityQuestionUrl).pipe(catchError(this.handleError));
  }

  restorePassword(userName: string, securityAnswer: string){
    let restorePasswordUrl = `${this.folderContentAuthenticationUrl}/Authenticate/RestorePassword/username=${userName}&securityAnswer=${securityAnswer}`;
    return this.http.get<string>(restorePasswordUrl).pipe(catchError(this.handleError));
  }

  deleteFromLocalStorageUserNameAndPassword() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  }

  deleteFromSessionStorageUserNameAndPassword() {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
  }

  saveToLocalStorageUserNameAndPassword(userName: string, password: string) {
    localStorage.setItem("username", userName);
    localStorage.setItem("password", password);
  }

  saveToSessionStorageUserNameAndPassword(userName: string, password: string) {
    sessionStorage.setItem("username", userName);
    sessionStorage.setItem("password", password);
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
          errorMessage = err.error;
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