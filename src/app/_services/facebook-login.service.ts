import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Constants } from '@app/constants';
import { AccountService } from './account.service';
import { concatMap, map } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { environment } from '@environments/environment';
import { EMPTY, from, of } from 'rxjs';
import { ILoginService } from './login.service';
//import { FakeBackendInterceptor } from '@app/_helpers';



@Injectable({
  providedIn: 'root'
})
export class FacebookLoginService implements ILoginService{

  

  constructor(private _accountService: AccountService,
    private http: HttpClient,
    private alertService: AlertService) {}


  signInWithAuthority(){
      // login with facebook then authenticate with the API to get a JWT auth token
      return this.facebookLogin()
      .pipe(concatMap(accessToken => this.apiAuthenticate(accessToken))).toPromise();
  }

  facebookLogin() {
      // login with facebook and return observable with fb access token on success
      return from(new Promise<fb.StatusResponse>(resolve => FB.login(resolve)))
          .pipe(concatMap(({ authResponse }) => {
              if (!authResponse) return EMPTY;
              return of(authResponse.accessToken);
          }));
  }

  apiAuthenticate(accessToken) {
      // authenticate with the api using a facebook access token,
      // on success the api returns an account object with a JWT auth token
      return this.http.post<any>(`${environment.apiUrl}/authenticate`, { 'token':accessToken })
          .pipe(map(user => {
              localStorage.setItem('user', JSON.stringify(user));
              this._accountService.notifyUser(user, this);              
              //this.startAuthenticateTimer(); todo
              return user;
          }));
  }





/*
  logout() {
    console.log("facebook completeLogout()");
    // revoke app permissions to logout completely because FB.logout() doesn't remove FB cookie
    return () => new Promise<void>(() => {
    FB.api('/me/permissions', 'delete', null, () => FB.logout())
    resolve();
    }
    //this.stopAuthenticateTimer(); //todo
  }
*/
  logout() {
    let promise = new Promise<void>((resolve, reject) => {
      console.log("facebook logout");
      FB.api('/me/permissions', 'delete', null, () => FB.logout())
      resolve();

    });
    return promise;
  }



}
