import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicModule, Events, Platform } from 'ionic-angular';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { SwingModule } from 'angular2-swing';
import { BrowserTab } from '@ionic-native/browser-tab';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NgxLogglyModule } from 'ngx-loggly-logger';
import { SocialSharing } from '@ionic-native/social-sharing';

import { Api, Settings, User, ScoreUtil, Memory, CategoryService,
         SecurityService, QuestionGenerator, RooErrorHandler, JhiParseLinks } from '../providers';
import { DefaultSettings } from '../models';
import { MyApp } from './app.component';
import { LoginService } from '../providers/login/login.service';
import { Principal } from '../providers/auth/principal.service';
import { AccountService } from '../providers/auth/account.service';
import { AuthInterceptor } from '../providers/auth/auth-interceptor';
import { HttpErrorHandlerInterceptor } from '../providers/api/http-error-handler-interceptor';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage, api:Api, platform: Platform) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, DefaultSettings.newInstance(), api, platform);
}

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true,
      scrollAssist: true,
      autoFocusAssist: 'immediate',
      keyboardHeight: 200
    }),
    IonicStorageModule.forRoot({
      name: '__roodb',
      driverOrder: ['sqlite', 'indexeddb', 'websql', 'localstorage']
    }),
    OAuthModule.forRoot(),
    NgProgressModule.forRoot(),
    NgProgressHttpModule,
    ChartsModule,
    NgxLogglyModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    User,
    Memory,
    ScoreUtil,
    LoginService,
    Principal,
    AccountService,
    LocalStorageService,
    SessionStorageService,
    SecurityService,
    QuestionGenerator,
    SplashScreen,
    StatusBar,
    TextToSpeech,
    SpeechRecognition,
    AppVersion,
    Market,
    SwingModule,
    BrowserTab,
    InAppBrowser,
    RooErrorHandler,
    SocialSharing,
    CategoryService,
    JhiParseLinks,
    { provide: Settings, useFactory: provideSettings, deps: [Storage, Api, Platform] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: RooErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorHandlerInterceptor, deps: [Events], multi: true },
    { provide: OAuthStorage, useValue: localStorage }
  ]
})
export class AppModule { }
