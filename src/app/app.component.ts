import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BrowserTab } from '@ionic-native/browser-tab';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, Events, App, ToastController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AppVersion } from '@ionic-native/app-version';

import { Settings, SecurityService } from '../providers';
import { Api } from '../providers/api/api';
import { Principal } from '../providers/auth/principal.service';
import { LoginService } from '../providers/login/login.service';
import { Account } from '../models/';
import { AUTH_REDIRECT_URI, AUTH_IAB_REDIRECT_URI, MAIL_SUPPORT,
         TELEGRAM_SUPPORT, TELEGRAM_CHANNEL, AUTH_URL } from './app.constants';

declare const window: any;

@Component({
  template: `
    <ion-menu [content]="content" side="left">
      <ion-header>
        <ion-toolbar>
          <ion-title>
            <span *ngIf="principal.isAuthenticated()" style="padding-left: 4px; padding-right: 4px;" (click)='refreshDname()'> {{dname}} </span>
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
          <button menuClose ion-item (click)="sendEmailToSupport()">
            <ion-icon name="mail" item-start></ion-icon>
            {{'SUPPORT_MAIL' | translate}}
          </button>
          <button menuClose ion-item (click)="sendMessageToSupport()">
            <ion-icon name="paper-plane" item-start></ion-icon>
            {{'SUPPORT_TELEGRAM' | translate}}
          </button>
          <button menuClose ion-item (click)="logout()" *ngIf="principal.isAuthenticated()">
            <ion-icon name="log-out" item-start></ion-icon>
            {{'LOGOUT_BUTTON' | translate}}
          </button>
        </ion-list>
      </ion-content>
      <ion-footer>
        <button menuClose ion-item (click)="openTelegramChannel()">
          <ion-icon name="paper-plane" color="telegram"></ion-icon>
          {{'TELEGRAM_CHANNEL' | translate}}
        </button>
      </ion-footer>
    </ion-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit {

  rootPage = 'WelcomePage';
  @ViewChild(Nav) nav: Nav;
  account: Account = new Account();
  dname: string;
  exitConfirmationText: string;
  onLangChangeSubscription: Subscription;
  appVersionNumber: string;
  appVersionCode: any;

  constructor(private translate: TranslateService, private platform: Platform,
    private settings: Settings, private config: Config, private ngZone: NgZone,
    private statusBar: StatusBar, private splashScreen: SplashScreen,
    private securityService: SecurityService, private api: Api, private app: App,
    private principal: Principal, private loginService: LoginService,
    private events: Events, private toastCtrl: ToastController, private browserTab: BrowserTab,
    private socialSharing: SocialSharing, private appVersion: AppVersion, private inAppBrowser: InAppBrowser) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#f4f4f4');
      this.splashScreen.hide();
      this.initTranslate();
      this.initAddAd();
      this.initAppVersion();
    });

    if (!this.securityService.oidc().hasValidAccessToken()) {
      this.initAuthentication();
    }

    const me = this;
    window.handleOpenURL = (url) => {
      setTimeout(function() {
        if (url === AUTH_REDIRECT_URI) {
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
            me.securityService.oidc().loadDiscoveryDocument().then((doc) => {
              me.securityService.oidc().tryLogin({
                customHashFragment: keyValuePair,
                disableOAuth2StateCheck: true,
                onTokenReceived: context => {
                  const claims = me.securityService.oidc().getIdentityClaims();
                  if (claims) {
                    me.events.publish('LOGIN_SUCCESS', claims);
                    me.getAccount();
                  }
                }
              });
            });
          }
        }
      }, 0);
    };
  }

  ngOnInit() {
    console.log('App init event.');
    this.events.subscribe('LOGIN_SUCCESS', (claims) => {
      console.log('Subscribe of LOGIN_SUCCESS triggered.', claims.preferred_username);
      let that = this;
      this.settings.load().then(() => {
        that.settings.loadCachedScoreLookups().subscribe();
      });
    });
    this.events.subscribe('INIT_TRANSLATIONS', () => {
      if (this.onLangChangeSubscription) this.onLangChangeSubscription.unsubscribe();
      this.onLangChangeSubscription = this.translate.onLangChange.subscribe((data) => {
        console.log('OnLangChange fired:', data.lang);
        this.platform.setLang(data.lang, true);
        this.platform.setDir((data.lang === 'fa') ? 'rtl' : 'ltr', true);
      });
      this.translate.setDefaultLang(this.settings.allSettings.language);
      this.translate.use(this.settings.allSettings.language).subscribe(() => {
        this.translate.get(['BACK_BUTTON_TEXT', 'EXIT_CONFIRMATION_TEXT']).subscribe(values => {
          this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
          this.exitConfirmationText = values.EXIT_CONFIRMATION_TEXT;
        });
      });
    });
    this.events.subscribe('HTTP_ERROR', (httpError: HttpErrorResponse) => {
      console.log('HTTP ERROR', httpError);
      if (httpError.url && httpError.url.indexOf('/api/account') !== -1) {
        return;
      }
      if (httpError && (httpError.status || httpError.status === 0)) {
        this.toastCtrl.create({
          message: httpError.status + '',
          duration: 2000,
          position: 'middle',
          dismissOnPageChange: true
        }).present();
      }
    });
  }

  initAuthentication() {
    const AUTH_CONFIG: string = 'authConfig';
    if (localStorage.getItem(AUTH_CONFIG)) {
      this.tryLogin();
    } else {
      // Try to get the oauth settings from the server
      this.api.get('api/auth-info').subscribe((data: any) => {
        const me = this;
        this.platform.ready().then(() => {
          this.browserTab.isAvailable().then((isAvailable) => {
            if (isAvailable) {
              data.redirectUri = AUTH_REDIRECT_URI;
            } else {
              data.redirectUri = AUTH_IAB_REDIRECT_URI;
            }
            // save in localStorage so redirect back gets config immediately
            localStorage.setItem(AUTH_CONFIG, JSON.stringify(data));
            me.securityService.oidc().configure(data);
            me.tryLogin();
          });
        });
      }, error => {
        console.error('ERROR fetching authentication information, defaulting to Keycloak settings', error);
        this.securityService.oidc().redirectUri = AUTH_REDIRECT_URI;
        this.securityService.oidc().clientId = 'web_app';
        this.securityService.oidc().scope = 'openid profile email offline_access';
        this.securityService.oidc().issuer = AUTH_URL + 'auth/realms/mars';
        this.tryLogin();
      });
    }
  }

  signin() {
    this.nav.push('WelcomePage').then(() => {
      const index = this.nav.getActive().index;
      try {
        this.nav.remove(0, index);
      } catch (err) { }
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

  openPage(page) {
    this.app.getActiveNavs()[0].push(page);
  }

  refreshDname() {
    this.dname = this.settings.allSettings.dname;
  }

  initTranslate() {
    this.ngZone.run(() => {
    this.settings.load().then(() => {
      this.events.publish('INIT_TRANSLATIONS');
      this.dname = this.settings.allSettings.dname;
    });
    });
  }

  initAddAd() {
    if (this.platform.is('android')) {
      window.adad.setUp();
      window.adad.DisableBanner();
      window.adad.onAdLoaded = function () {
        console.log('Adad#onAdLoaded');
      };
      window.adad.onAdFailedToLoad = function () {
        console.log('Adad#onAdFailedToLoad');
      };
      window.adad.onInterstitialAdDisplayed = function () {
        console.log('Adad#onInterstitialAdDisplayed');
      };
      window.adad.onRemoveAdsRequested = function () {
        console.log('Adad#onRemoveAdsRequested');
      };
      window.adad.onMessageReceive = function () {
        console.log('Adad#onMessageReceive');
      };
      window.adad.onInterstitialClosed = function () {
        console.log('Adad#onInterstitialClosed');
      };
    }
  }

  initAppVersion() {
    this.appVersion.getVersionNumber().then(versionNumber => {
      this.appVersionNumber = versionNumber;
    });
    this.appVersion.getVersionCode().then(versionCode => {
      this.appVersionCode = versionCode;
    });
  }

  sendEmailToSupport() {
    this.socialSharing.canShareViaEmail().then(() => {
      this.socialSharing.shareViaEmail(`\n\n\n\n Sent via Roo-${this.appVersionNumber}`, `[Roo-${this.appVersionCode}]`, [MAIL_SUPPORT]).then(() => {
      }).catch(() => {
        this.showEmailFailureToast('CONTACT_SUPPORT_VIA_EMAIL_FAILURE');
      });
    }).catch(() => {
      this.showEmailFailureToast('CONTACT_SUPPORT_VIA_EMAIL_NOT_AVAILABLE');
    });
  }

  sendMessageToSupport() {
    this.browserTab.isAvailable().then(isAvailable => {
      if (isAvailable) {
        this.browserTab.openUrl(`https://t.me/${TELEGRAM_SUPPORT}`);
      } else {
        this.inAppBrowser.create(`https://t.me/${TELEGRAM_SUPPORT}`, '_system');
      }
    });
  }

  openTelegramChannel() {
    this.browserTab.isAvailable().then(isAvailable => {
      if (isAvailable) {
        this.browserTab.openUrl(`https://t.me/${TELEGRAM_CHANNEL}`);
      } else {
        this.inAppBrowser.create(`https://t.me/${TELEGRAM_CHANNEL}`, '_system');
      }
    });
  }

  showEmailFailureToast(messageKey) {
    this.translate.get(messageKey, { email: MAIL_SUPPORT }).subscribe(message => {
      this.toastCtrl.create({
        message: message,
        duration: 10000,
        position: 'middle',
        dismissOnPageChange: true
      }).present();
    });
  }

  tryLogin() {
    // this.securityService.oidc().loadDiscoveryDocumentAndLogin().then(() => {
    //   this.securityService.oidc().events.filter(e => e.type === 'token_expires')
    //       .subscribe(() => {
    //         // this.securityService.oidc().refreshToken().then((refToken) => {  // TODO FIXME
    //         //   console.log('RefershToken really happend: ', refToken);
    //         // }).catch((err) => { console.log('RefereshToken error: ', err); });
    //       });
    //   const claims = this.securityService.oidc().getIdentityClaims();
    //   if (claims) {
    //     // this.events.publish('LOGIN_SUCCESS', claims);
    //     this.getAccount();
    //   }
    // }).catch(error => {
    //   if (error.params && error.params.error === 'unsupported_response_type') {
    //     let problem = 'You need to enable implicit flow for this app in your identity provider!';
    //     problem += '\nError from IdP: ' + error.params.error_description.replace(/\+/g, ' ');
    //     console.error(problem);
    //   }
    // });
  }

}
