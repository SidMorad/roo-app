import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { OAuthModule } from 'angular-oauth2-oidc';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { SwingModule } from 'angular2-swing';

import { Api, Settings, User, ScoreUtil } from '../providers/providers';
import { MyApp } from './app.component';
import { LoginService } from '../providers/login/login.service';
import { Principal } from '../providers/auth/principal.service';
import { AccountService } from '../providers/auth/account.service';
import { AuthInterceptor } from '../providers/auth/auth-interceptor';
import { EntityPageModule } from '../pages/entities/entity.module';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    profileFirstLoaded: false,
    language: 'fa',
    autoPlayVoice: true,
    autoContinue: true,
    voiceSpeedRate: 80,
    dname: 'Guest'
  });
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
      tabsHideOnSubPages: true
    }),
    IonicStorageModule.forRoot(),
    EntityPageModule,
    OAuthModule.forRoot(),
    NgProgressModule.forRoot(),
    NgProgressHttpModule,
    ChartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    User,
    ScoreUtil,
    LoginService,
    Principal,
    AccountService,
    LocalStorageService,
    SessionStorageService,
    Camera,
    SplashScreen,
    StatusBar,
    TextToSpeech,
    SpeechRecognition,
    AppVersion,
    Market,
    SwingModule,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule { }
