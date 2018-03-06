import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ViewController, App } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';

import { MainPage } from '../pages';
import { Principal } from '../../providers/auth/principal.service';

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage implements OnInit {
  isTryingToLogin: boolean;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public principal: Principal, public app: App,
              private oauthService: OAuthService) {
  }

  ngOnInit() {
    this.isTryingToLogin = true;
    // const AUTH_CONFIG: string = 'authConfig';
    // if (localStorage.getItem(AUTH_CONFIG)) {
      // const authConfig: AuthConfig = JSON.parse(localStorage.getItem(AUTH_CONFIG));
      // this.oauthService.configure(authConfig);
      // this.oauthService.tokenValidationHandler = new JwksValidationHandler();
      const claims: any = this.oauthService.getIdentityClaims();
      if (!claims) {
        this.oauthService.loadDiscoveryDocumentAndLogin().then(() => {
          console.log('Great we are logged in.');
          this.geAccount();
        }).catch(error => {
          console.log('Oops login implicit flow failed!');
          this.isTryingToLogin = false;
        });
      } else {
        this.geAccount();
      }
    // }
  }

  geAccount() {
    this.principal.identity().then((account) => {
      if (account !== null) {
        this.home();
      } else {
        this.isTryingToLogin = false;
      }
    });
  }

  login() {
    this.navCtrl.push('LoginPage');
    this.viewCtrl.dismiss();
  }

  home() {
    this.app.getRootNavs()[0].setRoot(MainPage);
  }

}
