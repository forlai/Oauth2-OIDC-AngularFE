import { Injectable } from '@angular/core';
import { Constants } from '@app/constants';
import { UserManager, User, UserManagerSettings } from "oidc-client";
import { AccountService } from './account.service';
import { ILoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleLoginService implements ILoginService{

  private _userManager: UserManager;
  

  constructor(private _accountService: AccountService) { 
        /*GOOGLE*/
        const stsSettings = {
          authority: Constants.gStsAuthority,
          client_id: Constants.gClientId,
          client_secret : Constants.gClientSecret,
          redirect_uri: `${Constants.clientRoot}signin-callback`,
          scope: "openid email profile",
          response_type: "code", // defines the flow to use: code => Authorization Code flow pkce
          post_logout_redirect_uri: `${Constants.clientRoot}signout-callback`,
          automaticSilentRenew: true,
          silent_redirect_uri: `${Constants.clientRoot}assets/silent-callback.html`,
          //from https://accounts.google.com/.well-known/openid-configuration
          metadata: {
              issuer: `https://accounts.google.com`,
              authorization_endpoint: `https://accounts.google.com/o/oauth2/v2/auth`,
              token_endpoint: `https://oauth2.googleapis.com/token`,
              jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
              end_session_endpoint: `https://accounts.google.com/o/oauth2/revoke`,
              userinfo_endpoint: `https://openidconnect.googleapis.com/v1/userinfo`,
              revocation_endpoint: `https://oauth2.googleapis.com/revoke`
              
            }
      };


      this._userManager = new UserManager(stsSettings);

      this._userManager.events.addAccessTokenExpired(_ => {
        console.log('Google token expired')
        localStorage.removeItem('user');
        this._accountService.notifyUser(null, null);
      });

      this._userManager.events.addUserLoaded(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this._accountService.notifyUser(user, this);
      });      

  }



    //oidc: response_type = code
    signInWithAuthority() {        
      return this._userManager.signinRedirect();   
  }



  //oidc: response_type = code
  completeSignInWithAuthority() {
      return this._userManager.signinRedirectCallback().then(user => {
          localStorage.setItem('user', JSON.stringify(user));
          this._accountService.notifyUser(user, this);
          return user;
      });
  }

  logout() {
    let promise = new Promise<void>((resolve, reject) => {
      console.log("google logout");
      //this._userManager.signoutRedirect(); //todo: la revoke su google non funziona, evidentemente non è oidc compliant, se si ripristina rimuovere le 3 righe sotto
      resolve();

    });
    return promise;
  }


  completeLogout() {
      console.log("google completeLogout()");
      localStorage.removeItem('user');
      this._accountService.notifyUser(null,null);
      //this._userManager.signoutRedirect(); //todo: la revoke su google non funziona, evidentemente non è oidc compliant, se si ripristina rimuovere le 3 righe sotto
      return this._userManager.signoutRedirectCallback();

  }



}
