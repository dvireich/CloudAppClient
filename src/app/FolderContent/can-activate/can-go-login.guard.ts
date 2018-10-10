import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FolderContnentService } from '../Folder-content-service/folder-content-service';
import { AuthenticationService } from '../authentication-service/authentication-service';

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {

    constructor(private authenticationService: AuthenticationService, private folderContentService: FolderContnentService) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const url = next.url[0].path;
        if (url === 'login') {
            if (this.folderContentService.isInitialized()) {
                let ans = confirm("Are you sure you want to leave?. If you will press ok you will be logout.");
                if(!ans) return false;
                this.folderContentService.logout();
            }
            return true;
        }

        return false;
    }
}
