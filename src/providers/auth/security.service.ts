import { Injectable } from '@angular/core';
import { OAuthService, JwksValidationHandler, AuthConfig } from 'angular-oauth2-oidc';
// import { Subject } from 'rxjs/Subject';

@Injectable()
export class SecurityService {

  // private authenticated = new Subject<boolean>();

  constructor(private oauthService: OAuthService) {
    oauthService.setStorage(localStorage);
    oauthService.tokenValidationHandler = new JwksValidationHandler();
    const AUTH_CONFIG: string = 'authConfig';
    if (localStorage.getItem(AUTH_CONFIG)) {
      const authConfig: AuthConfig = JSON.parse(localStorage.getItem(AUTH_CONFIG));
      // console.log('AUTH_CONFIG: ', authConfig);
      this.oauthService.configure(authConfig);
      this.oauthService.dummyClientSecret = 'ce33892c-bd46-429f-a91d-65358439f127';
    }
    this.oauthService.useIdTokenHintForSilentRefresh = true;
    // this.oauthService.skipSubjectCheck = false;
    this.oauthService.oidc = true;
    this.oauthService.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html',
    this.oauthService.setupAutomaticSilentRefresh();
    // this.oauthService.refreshToken().then((refToken) => { // TODO FIXME
    //   console.log('RefershToken really happend: ', refToken);
    // }).catch((err) => { console.log('RefereshToken error: ', err); });
    // console.log('OIDC DEBUG: ', this.oauthService);
  }

  oidc(): OAuthService {
    return this.oauthService;
  }

}
