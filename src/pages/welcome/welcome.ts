import { Component, OnInit } from '@angular/core';
import { IonicPage, App, Events, Platform } from 'ionic-angular';
import { BrowserTab } from '@ionic-native/browser-tab';

// import { MainPage } from '../pages';
import { LoginService, Principal, SecurityService } from '../../providers';

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

  constructor(private principal: Principal, private app: App,
              private loginService: LoginService, private events: Events,
              private securityService: SecurityService, private browserTab: BrowserTab,
              private platform: Platform) {
    this.platform.ready().then(() => {
      this.platform.resume.subscribe(() => {
        this.isTryingToLogin = false;
      });
    });
  }

  ngOnInit() {
    this.isTryingToLogin = true;
    this.platform.ready().then(() => {
    this.browserTab.isAvailable().then((isAvailable) => {
      console.log('So browserTab is available or not? ', isAvailable);
      if (isAvailable) {
        if (!this.securityService.oidc().hasValidAccessToken()) {
          this.securityService.oidc().loadDiscoveryDocumentAndTryLogin().then(() => {
            // this.geAccount();
            this.isTryingToLogin = false;
          }).catch((error) => {
            console.log('Well loadAuthAndTryLogin failed with error ', error);
            this.isTryingToLogin = false;
          });
        } else {
          // console.log('Cliams ', claims);
          this.events.publish('LOGIN_SUCCESS', this.securityService.oidc().getIdentityClaims());
          console.log('Login succeed in welcome page, actually...');
          this.browserTab.close();
          setTimeout(() => {
            this.geAccount();
          }, 300);
        }
      } else {
        this.isTryingToLogin = false;
      }
    });
    });
  }

  geAccount() {
    this.principal.identity().then((account) => {
      if (account) {
        this.home();
      } else {
        this.isTryingToLogin = false;
      }
    });
  }

  login() {
    this.isTryingToLogin = true;
    // this.principal.identity().then((account) => {
      // if (account) {
        // this.home();
      // } else {
        this.loginService.appLogin((data) => {
          this.isTryingToLogin = false;
          this.home();
        }, (err) => {
          console.log('WelcomePage: Login failed.', err);
          this.isTryingToLogin = false;
        });
      // }
    // });
  }

  home() {
    // this.navCtrl.push('TabsPage').then(() => {
    //   const index = this.navCtrl.getActive().index;
    //   this.navCtrl.remove(0, index);
    // });
    this.app.getRootNavs()[0].setRoot('TabsPage');
    // try {
    //   this.viewCtrl.dismiss();
    // } catch(err) { console.warn('Error on dismiss welcome page: ', err) }
  }

}
