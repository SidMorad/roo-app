import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ViewController, App, Events } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';

// import { MainPage } from '../pages';
import { LoginService, Principal } from '../../providers';

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
  isTryingToLogin: boolean = true;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public principal: Principal, public app: App,
              private loginService: LoginService, private events: Events,
              private oauthService: OAuthService) {
  }

  ngOnInit() {
    this.isTryingToLogin = true;
    this.oauthService.setStorage(localStorage);
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) {
      this.oauthService.loadDiscoveryDocumentAndLogin().then(() => {
        this.geAccount();
        console.log('Well loadAuthAndTryLogin succeed, accessTokenExpiration is ', this.oauthService.getAccessTokenExpiration());
      }).catch((error) => {
        console.log('Well loadAuthAndTryLogin failed with error ', error);
        this.isTryingToLogin = false;
      });
    } else {
      // console.log('Cliams ', claims);
      this.events.publish('LOGIN_SUCCESS', claims);
      this.geAccount();
    }
  }

  geAccount() {
    this.principal.identity(true).then((account) => {
      if (account) {
        this.home();
      } else {
        this.isTryingToLogin = false;
      }
    });
  }

  login() {
    this.loginService.appLogin((data) => {
      this.home();
    }, (err) => {
      console.log('WelcomePage: Login failed.');
    });
  }

  home() {
    this.navCtrl.push('TabsPage').then(() => {
      const index = this.navCtrl.getActive().index;
      this.navCtrl.remove(0, index);
    });
    // this.app.getRootNavs()[0].setRoot(MainPage);
    // try {
    //   this.viewCtrl.dismiss();
    // } catch(err) { console.warn('Error on dismiss welcome page: ', err) }
  }

}
