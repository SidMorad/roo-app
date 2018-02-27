import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { MainPage } from '../pages/pages';
import { Settings } from '../providers/providers';
import { AuthConfig, JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import { Api } from '../providers/api/api';
import { TabsPage } from '../pages/tabs/tabs';

declare const window: any;

@Component({
    template: `
    <ion-menu [content]="content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Pages</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <button menuClose ion-item *ngFor="let p of pages" (click)="openPage(p)">
            {{p.title}}
          </button>
        </ion-list>
      </ion-content>
    </ion-menu>
    <ion-nav #content [root]="rootPage"></ion-nav>`
})
export class MyApp {
    rootPage = MainPage;

    @ViewChild(Nav) nav: Nav;

    pages: any[] = [
        {title: 'Welcome', component: 'WelcomePage'},
        {title: 'Tabs', component: 'TabsPage'},
        {title: 'Login', component: 'LoginPage'},
        {title: 'Signup', component: 'SignupPage'},
        // {title: 'Menu', component: 'MenuPage'},
        {title: 'Settings', component: 'SettingsPage'},
        {title: 'Entities', component: 'EntityPage'}
    ];

    constructor(private translate: TranslateService, private platform: Platform,
                settings: Settings, private config: Config,
                private statusBar: StatusBar, private splashScreen: SplashScreen,
                private oauthService: OAuthService, private api: Api,
                private dragulaService: DragulaService) {
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });

        this.initTranslate();
        this.initAuthentication();
        this.initDragulaConfigs();

        const me = this;
        window.handleOpenURL = (url) => {
          setTimeout(function() {
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
                    disableOAuth2StateCheck: true
                });
                me.oauthService.getIdentityClaims();
                me.nav.setRoot(TabsPage);
            }
          }, 0);
        };
    }

    initAuthentication() {
        const AUTH_CONFIG: string = 'authConfig';
        // use local storage to optimize authentication config
        if (localStorage.getItem(AUTH_CONFIG)) {
            const authConfig: AuthConfig = JSON.parse(localStorage.getItem(AUTH_CONFIG));
            this.oauthService.configure(authConfig);
            localStorage.removeItem(AUTH_CONFIG);
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
        this.oauthService.loadDiscoveryDocumentAndTryLogin().catch(error => {
            if (error.params && error.params.error === 'unsupported_response_type') {
                let problem = 'You need to enable implicit flow for this app in your identity provider!';
                problem += '\nError from IdP: ' + error.params.error_description.replace(/\+/g, ' ');
                console.error(problem);
            }
        })
    }

    initTranslate() {
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang('en');

        // if (this.translate.getBrowserLang() !== undefined) {
        //     this.translate.use(this.translate.getBrowserLang());
        // } else {
        //     this.translate.use('en'); // Set your language here
        // }

        this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
            this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
        });
    }

    initDragulaConfigs() {
      this.dragulaService.setOptions('four-pic', {
        copy: false
      });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

}
