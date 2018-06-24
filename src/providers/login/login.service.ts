import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { BrowserTab } from '@ionic-native/browser-tab';

import { Principal, SecurityService } from '../';

declare const window: any;

@Injectable()
export class LoginService {

  constructor(private securityService: SecurityService, private platform: Platform,
    private principal: Principal, private browserTab: BrowserTab,
    private events: Events) { }

  redirectLogin() {
    this.securityService.oidc().initImplicitFlow();
  }

  // appLogin(cb, fail) {
  //   this.securityService.oidc().loadDiscoveryDocumentAndLogin().then(() => {
  //     const claims = this.securityService.oidc().getIdentityClaims();
  //     this.events.publish('LOGIN_SUCCESS', claims);
  //     return cb(claims);
  //   }).catch((err) => { return fail(err); });
  // }

  appLogin(cb, fail) {
    return this.oauthLogin().then(success => {
      const idToken = success.id_token;
      const accessToken = success.access_token;
      const keyValuePair = `#id_token=${encodeURIComponent(idToken)}&access_token=${encodeURIComponent(accessToken)}`;
      this.securityService.oidc().loadDiscoveryDocument().then((doc) => {
        this.securityService.oidc().tryLogin({
          customHashFragment: keyValuePair,
          disableOAuth2StateCheck: true,
          onTokenReceived: context => {
            console.log('login.service#onTokenReceived: ', context);
            const claims: any = this.securityService.oidc().getIdentityClaims();
            if (claims) {
              this.events.publish('LOGIN_SUCCESS', claims);
            }
            return cb(claims);
          }
        });
      });
      // this.translate.use(account.langKey);
    }, (error) => {
      return fail(error);
    });
  }

  oauthLogin(): Promise<any> {
    const defaultError = 'Problem authenticating with OAuth';
    const that = this;
    console.log("#1debug oauthLogin");
    return this.securityService.oidc().createAndSaveNonce().then(nonce => {
      let state: string = Math.floor(Math.random() * 1000000000).toString();
      console.log("#2debug state", state);
      if (window.crypto) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        state = array.join().toString();
        console.log("#2debug state+crypto", state);
      }
      return new Promise((resolve, reject) => {
        const oauthUrl = this.buildUrl(state, nonce);
        console.log("#3debug oauthUrl", oauthUrl);
        this.platform.ready().then(() => {
          console.log("#4debug platform is ready.");
          that.browserTab.isAvailable().then((result) => {
            console.log("#5debug browserTab#isAvailable", result);
            if (result) {
              console.log('BrowserTab is about to open', oauthUrl);
              that.browserTab.openUrl(oauthUrl).then(
                function(success) {
                  console.log('BrowserTab#success: ', success);
                  if (typeof success === 'string' && success.startsWith('No Activity found to')) {
                    reject(defaultError);
                  }
                },
                function(error) { console.log('Acutally failed, ', error); reject(defaultError); }
              );
            } else {
              const browser = window.cordova.InAppBrowser.open(oauthUrl, '_blank',
                'location=no,clearsessioncache=no,clearcache=no');
              console.log('BrowserTab is about to open', oauthUrl);
              browser.addEventListener('loadstart', (event) => {
                console.log('So loadstart event happend: ', event);
                if ((event.url).indexOf('http://localhost:8100') === 0) {
                  browser.removeEventListener('exit', () => {});
                  browser.close();
                  const responseParameters = ((event.url).split('#')[1]).split('&');
                  const parsedResponse = {};
                  for (let i = 0; i < responseParameters.length; i++) {
                    parsedResponse[responseParameters[i].split('=')[0]] =
                      responseParameters[i].split('=')[1];
                  }
                  if (parsedResponse['state'] !== state) {
                    reject(defaultError);
                  } else if (parsedResponse['access_token'] !== undefined &&
                    parsedResponse['access_token'] !== null) {
                    resolve(parsedResponse);
                  } else {
                    reject(defaultError);
                  }
                }
              });
              browser.addEventListener('exit', function(event) {
                reject('The OAuth sign in flow was canceled');
              });
            }
          });
        });
      });
    });
  }

  buildUrl(state, nonce): string {
    console.log('DEGUB: ', this.securityService.oidc());
    return `${this.securityService.oidc().issuer}/protocol/openid-connect/auth?` +
      'client_id=' + this.securityService.oidc().clientId + '&' +
      'redirect_uri=' + this.securityService.oidc().redirectUri + '&' +
      'response_type=id_token%20token&' +
      'scope=' + encodeURI(this.securityService.oidc().scope) + '&' +
      'state=' + state + '&nonce=' + nonce;
  }

  logout() {
    if (this.platform.is('core')) {
      // do global logout when using browser
      this.securityService.oidc().logOut();
    } else {
      // don't redirect to global logout in app
      this.securityService.oidc().logOut(true);
    }
    this.principal.authenticate(null);
  }

}
