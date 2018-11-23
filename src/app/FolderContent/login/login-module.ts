import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FolderContentLogin } from './folder-content-login.component/folder-content-login.component';
import { LoginGuard } from './can-activate/can-go-login.guard';
import { SharedModule } from '../../Common/common.module';
import { ForgotPassword } from './folder-content-login.component/forgot-pasword/forgot-password.component/forgot-password.component';



@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'login', component: FolderContentLogin, canActivate: [LoginGuard] }
    ]),
    SharedModule
  ],
  declarations: [
    ForgotPassword,
    FolderContentLogin
  ]
})
export class LoginModule { }
