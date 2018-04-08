import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, Events, ToastController, App } from 'ionic-angular';
import { AuthConfig, JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';

import { FirstRunPage } from '../pages/pages';
import { Settings } from '../providers/providers';
import { Api } from '../providers/api/api';
import { Principal } from '../providers/auth/principal.service';
import { LoginService } from '../providers/login/login.service';
import { TranslDir, Account } from '../models/';

declare const window: any;

@Component({
  template: `
    <ion-menu [content]="content" side="left">
      <ion-header>
        <ion-toolbar>
          <ion-title>
            <span *ngIf="principal.isAuthenticated()" style="padding-left: 4px; padding-right: 4px;"> {{dname}} </span>
            <button ion-button clear large (click)="signin()" *ngIf="!principal.isAuthenticated()" menuClose color="dark"
                style="padding-left: 0px; padding-right: 0px;">
              <ion-icon name="log-in"></ion-icon>
              <span style="padding-left: 16px; padding-right: 16px;"> {{'LOGIN_BUTTON' | translate}} </span>
            </button>
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <button menuClose ion-item (click)="openPage('SettingsPage')">
            <ion-icon name="settings" item-start></ion-icon>
            {{'SETTINGS_TITLE' | translate}}
          </button>
          <button menuClose ion-item (click)="logout()" *ngIf="principal.isAuthenticated()">
           <ion-icon name="contact" item-start></ion-icon>
           {{'LOGOUT_BUTTON' | translate}}
         </button>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>`,
    styleUrls: [
      '/app/introjs.scss'
    ]
})
export class MyApp implements OnInit {

  rootPage = FirstRunPage;
  @ViewChild(Nav) nav: Nav;
  account: Account = new Account();
  dname: string;
  exitConfirmationText: string;

  constructor(private translate: TranslateService, private platform: Platform,
    private settings: Settings, private config: Config, private ngZone: NgZone,
    private statusBar: StatusBar, private splashScreen: SplashScreen,
    private oauthService: OAuthService, private api: Api, private app: App,
    private principal: Principal, private loginService: LoginService,
    private events: Events, private toastCtrl: ToastController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initTranslate();
      this.registerBackButtonAction();
    });

    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) {
      this.initAuthentication();
    }

    const me = this;
    window.handleOpenURL = (url) => {
      setTimeout(function() {
        if (url === 'marsroo://oauth2redirect') {
          me.getAccount();
        } else {
          const responseParameters = (url.split('#')[1]).split('&');
          const parsedResponse = {};
          for (let i = 0; i < responseParameters.length; i++) {
            parsedResponse[responseParameters[i].split('=')[0]] =
              responseParameters[i].split('=')[1];
          }
          if (parsedResponse['access_token'] !== undefined &&
            parsedResponse['access_token'] !== null) {
            const idToken = parsedResponse['id_token'];
            const accessToken = parsedResponse['access_token'];
            const keyValuePair = `#id_token=${encodeURIComponent(idToken)}&access_token=${encodeURIComponent(accessToken)}`;
            me.oauthService.tryLogin({
              customHashFragment: keyValuePair,
              disableOAuth2StateCheck: true,
              onTokenReceived: context => {
                me.getAccount();
              }
            });
            const claims = me.oauthService.getIdentityClaims();
            if (!claims) {
              me.events.publish('LOGIN_SUCCESS', claims);
            }
          }
        }
      }, 0);
    };
  }

  ngOnInit() {
    console.log('App init event.');
    this.events.subscribe('LOGIN_SUCCESS', (cliams) => {
      this.api.getScoreLookup(TranslDir.FA$EN_UK).subscribe();
      if (!this.settings.allSettings.profileFirstLoaded) {
        let that = this;
        setTimeout(() => {
          that.nav.push('ProfileFirstPage');
        }, 3000);
      }
    });
  }

  initAuthentication() {
    const AUTH_CONFIG: string = 'authConfig';
    // use local storage to optimize authentication config
    if (localStorage.getItem(AUTH_CONFIG)) {
      const authConfig: AuthConfig = JSON.parse(localStorage.getItem(AUTH_CONFIG));
      this.oauthService.configure(authConfig);
      // localStorage.removeItem(AUTH_CONFIG);  // AuthConfig will no change oftern, so let's keep it in local storage.
      this.tryLogin();
    } else {
      // Try to get the oauth settings from the server
      this.api.get('/api/auth-info').subscribe((data: any) => {
        const me = this;
        this.platform.ready().then(() => {
          window.cordova.plugins.browsertab.isAvailable(function(result) {
            if (result) {
              data.redirectUri = 'marsroo://oauth2redirect';
            } else {
              data.redirectUri = 'http://localhost:8100';
            }
            // save in localStorage so redirect back gets config immediately
            localStorage.setItem(AUTH_CONFIG, JSON.stringify(data));
            me.oauthService.configure(data);
            me.tryLogin();
          });
        });
      }, error => {
        console.error('ERROR fetching authentication information, defaulting to Keycloak settings');
        this.oauthService.redirectUri = 'http://localhost:8100';
        this.oauthService.clientId = 'web_app';
        this.oauthService.scope = 'openid profile email';
        this.oauthService.issuer = 'http://localhost:9080/auth/realms/jhipster';
        this.tryLogin();
      });
    }
  }

  tryLogin() {
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.getAccount();
    }).catch(error => {
      if (error.params && error.params.error === 'unsupported_response_type') {
        let problem = 'You need to enable implicit flow for this app in your identity provider!';
        problem += '\nError from IdP: ' + error.params.error_description.replace(/\+/g, ' ');
        console.error(problem);
      }
    });
  }

  signin() {
    this.nav.push('LoginPage').then(() => {
      const index = this.nav.getActive().index;
      this.nav.remove(0, index);
    });
  }

  logout() {
    this.account = {};
    this.loginService.logout();
  }

  getAccount() {
    this.principal.identity().then(account => {
      this.account = account !== null ? account : {};
    });
  }

  registerBackButtonAction() {
    // Handle back button for exit confirmation
    let lastTimeBackPressed = 0;
    const timePeriodToExit = 3000;
    const nav = this.app.getActiveNav();
    this.platform.registerBackButtonAction(() => {
      console.log(nav.getActive().name);
      // if (nav.getActive().name === 'TabsPage') {
        if (nav.canGoBack()) {
          nav.pop();
        }
        else {
          if (new Date().getTime() - lastTimeBackPressed < timePeriodToExit) {
            this.platform.exitApp();
          }
          else {
            this.toastCtrl.create({
              message: this.exitConfirmationText,
              duration: 3000
            }).present();
            lastTimeBackPressed = new Date().getTime();
          }
        }
      // }
    });
  }

  initTranslate() {
    this.ngZone.run(() => {
    this.settings.load().then(() => {
      this.translate.onLangChange.subscribe((data) => {
        console.log('OnLangChange fired:', data);
        this.platform.setLang(data.lang, true);
        this.platform.setDir((data.lang === 'fa') ? 'rtl' : 'ltr', true);
      });
      this.translate.setDefaultLang(this.settings.allSettings.language);
      this.translate.use(this.settings.allSettings.language);
      this.translate.get(['BACK_BUTTON_TEXT', 'EXIT_CONFIRMATION_TEXT']).subscribe(values => {
        this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
        this.exitConfirmationText = values.EXIT_CONFIRMATION_TEXT;
      });
      this.dname = this.settings.allSettings.dname;
    });
    });
  }

  openPage(page) {
    this.nav.push(page);
  }

}
