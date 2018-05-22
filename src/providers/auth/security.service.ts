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
      this.oauthService.configure(authConfig);
    }
    this.oauthService.setupAutomaticSilentRefresh();
  }

  oidc(): OAuthService {
    return this.oauthService;
  }

}
