import { Constants } from '@app/constants';
import { FacebookLoginService } from '@app/_services';

//import { environment } from '@environments/environment';

export function appInitializer(facebookLoginService: FacebookLoginService) {
    return () => new Promise<void>(resolve => {
        
        // wait for facebook sdk to initialize before starting the angular app
        window['fbAsyncInit'] = function () {
            FB.init({
                appId: Constants.fClientId,//environment.facebookAppId,
                status: false,
                cookie: false,
                xfbml: false,
                version: 'v8.0'
            });
            console.log("inizializzano");
            
            // auto authenticate with the api if already logged in with facebook
            FB.getLoginStatus(({authResponse}) => {

                resolve();
                /*per auto-authenticate
                if (authResponse) {

                    facebookLoginService.apiAuthenticate(authResponse.accessToken)
                        .subscribe()
                        .add(resolve);

                } else {
                    resolve();
                }
                */
            });
            
        };

        // load facebook sdk script
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));    
    });
}

