import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController,
         ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { BrowserTab } from '@ionic-native/browser-tab';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Storage } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio';

import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Principal, Api, LoginService, Settings } from '../../providers';
import { SubscribeModel, SubscriptionType, Account } from '../../models';
import { ENV } from '@app/env';

declare var inappbilling: any;

/**
 * The Subscribe page is a simple form
 * to enable customers to subscribe to premium membership.
 *
 */
@IonicPage()
@Component({
  selector: 'page-subscribe',
  templateUrl: 'subscribe.html'
})
export class SubscribePage {

  inProgress: boolean = false;
  isMember: boolean = false;
  reCheck: boolean = false;
  resumeSubscription: any;
  toastInstance: any;
  private readonly lastSubscribeKey = 'LAST_SUBSCRIBE';

  constructor(platform: Platform, private browserTab: BrowserTab,
              private principal: Principal, private toastCtrl: ToastController,
              private api: Api, private alertCtrl: AlertController, private ngZone: NgZone,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private loginService: LoginService, private inAppBrowser: InAppBrowser,
              private storage: Storage, private nativeAudio: NativeAudio,
              private settings: Settings) {
    this.initTranslations();
    this.resumeSubscription = platform.resume.subscribe(() => {
      console.log('onResume event occured.');
      this.reCheckMembership();
    });
    platform.ready().then(() => {
      if (platform.is('android') && !ENV.isPlay) {
        inappbilling.init(function (success) {
          console.log('Initialize InAppBilling plugin succeed: ', success);
        }, function (error) {
          console.log('Initialize InAppBilling failed with error: ', error);
        }, { showLog: true });
      }
      this.nativeAudio.preloadSimple('coinSparkle', 'assets/sounds/coinSparkle.mp3');
    });
  }

  ionViewDidEnter() {
    this.reCheckMembership();
    if (this.settings.allSettings.soundEffects) {
      this.nativeAudio.play('coinSparkle');
    }
  }

  ionViewWillUnload() {
    this.resumeSubscription.unsubscribe();
  }

  resolveImageUrl(imageName) {
    return IMAGE_ORIGIN + imageName;
  }

  subscribe(subscriptionType: SubscriptionType) {
    const that = this;
    this.ngZone.run(() => {
      this.inProgress = true;
      if (!this.principal.isAuthenticated()) {
        that.showLoginToast(5000);
      }
      else {
        this.principal.identity().then((account) => {
          const month = subscriptionType.toString() === SubscriptionType.toString(SubscriptionType.ONE_MONTH) ? 1 : 12;
          that.translateService.get('PAYMENT_DESCRIPTION', { month: month, customer: account.login }).subscribe((paymentDescription: string) => {
            that.alertCtrl.create({
              title: that.continueLabel,
              message: paymentDescription,
              inputs: that.resolvePaymentOptions(),
              buttons: [
                {
                  text: that.cancelLabel,
                  role: 'cancel',
                  handler: () => {
                    that.inProgress = false;
                  }
                },
                {
                  text: that.continueLabel,
                  handler: (data) => {
                    const subscribeModel = new SubscribeModel(paymentDescription, subscriptionType);
                    if (data === 'zarinpal') {
                      that.api.startPayUrl(subscribeModel).subscribe((paymentUrl) => {
                        that.browserTab.isAvailable().then(function(result) {
                          if (result) {
                            that.browserTab.openUrl(paymentUrl + '').then(
                              function(success) { console.log('BrowserTab#success', success); },
                              function(error) { console.log('BrowserTab#error', error); }
                            );
                          } else {
                            const browser = that.inAppBrowser.create(paymentUrl + '', '_blank',
                                'location=no,clearsessioncache=no,clearcache=no');
                            browser.on('loadstart').subscribe((event) => {
                              console.log('InAppBrowser#loadStart', event);
                            });
                            browser.on('exit').subscribe((event) => {
                              console.log('InAppBrowser#exit', event);
                              that.reCheckMembership();
                            });
                          }
                          that.reCheck = true;
                        });
                      }, (error) => {
                        that.inProgress = false;
                        that.toastCtrl.create({
                          message: 'Error ' + error.status,
                          duration: 3000
                        }).present();
                      });
                    } else if (data === 'cafebazaar') {
                      console.log('Attempt to subscribe to ', `ROO_${subscriptionType.toString()}`);
                      inappbilling.subscribe(function (success) {
                        console.log('Subscription succeed: ', success);
                        subscribeModel.paymentApiReturnString = JSON.stringify(success);
                        that.api.subscribeWithCafebazaar(subscribeModel).subscribe((success) => {
                          console.log('Subscription stored in the server successfully.', success);
                          that.reCheckMembership();
                        }, (error)=> {
                          that.storage.set(that.lastSubscribeKey, JSON.stringify(subscribeModel)).then((res) => {
                            that.reCheck = true;
                          });
                          that.toastCtrl.create({ message: 'Error server-side: ' + error,
                            duration: 4000, position: 'middle' }).present();
                          that.inProgress = false;
                        });
                      }, function (error) {
                        that.toastCtrl.create({ message: 'Error client-side: ' + error,
                          duration: 4000, position: 'middle' }).present();
                        that.inProgress = false;
                      }, `ROO_${subscriptionType.toString()}`);
                    } else if (data === 'avvalmarket') {
                      console.log('Attempt to subscribe with AvvalMarket to ', `ROO_${subscriptionType.toString()}_TEST`);
                      inappbilling.subscribe(function (success) {
                        subscribeModel.paymentApiReturnString = JSON.stringify(success);
                        console.log('Subscription succeed: ', success);
                        that.api.subscribeWithAvvalMarket(subscribeModel).subscribe(success => {
                          console.log('Subscription stored in server successfully.', success);
                          that.reCheckMembership();
                        }, error => {
                          that.storage.set(that.lastSubscribeKey, JSON.stringify(subscribeModel)).then( res => {
                            that.reCheck = true;
                          });
                          that.toastCtrl.create({ message: 'Error server-side: ' + error,
                            duration: 4000, position: 'middle' }).present();
                          that.inProgress = false;
                        });
                      }, function (error) {
                        that.toastCtrl.create({ message: 'Error client-side: ' + error,
                          duration: 4000, position: 'middle' }).present();
                        that.inProgress = false;
                      }, `ROO_${subscriptionType.toString()}_TEST`);
                    } else if (data == 'googleplay') {
                      console.log('Attempt to subscribe to ', `roo_play_${subscriptionType.toString().toLowerCase()}`);
                      inappbilling.subscribe(function(success) {
                        console.log('Subscription succeed: ', success);
                        subscribeModel.paymentApiReturnString = JSON.stringify(success);
                        // TODO | FIXME
                      }, function(error) {
                        console.log('Subscription failed: ', error);
                      // }, `roo_play_${subscriptionType.toString().toLowerCase()}`);
                    }, `android.test.purchased`);
                    }
                  }
                }
              ]
            }).present();
          });
        });
      }
    });
  }

  reCheckMembership() {
    this.ngZone.run(() => {
    this.inProgress = true;
    this.storage.get(this.lastSubscribeKey).then((subscribeModel) => {
      console.log('SubscribeModel was ', subscribeModel);
      if (subscribeModel) {
        this.api.subscribeWithCafebazaar(JSON.parse(subscribeModel)).subscribe((success) => {
          this.storage.remove(this.lastSubscribeKey).then(() => {
            this.reCheckMembership();
          });
        }, (error)=> {
          this.toastCtrl.create({
            message: 'Error on register subscribtion: ' + error,
            duration: 4000, position: 'middle' }).present();
          this.reCheck = true;
        });
      }
      else {
        this.principal.identity(true).then((account: Account) => {
          if (account) {
            this.isMember = account.member;
            if (this.isMember) {
              this.reCheck = false;
            }
          }
          else {
            this.showLoginToast(3000);
          }
          this.inProgress = false;
        }).catch((err) => {
          this.inProgress = false;
        });
      }
    });
    });
  }

  resolvePaymentOptions(): any[] {
    console.log('ENV#', ENV.isPlay, ENV.isCafe, ENV.isAval);
    let res = [];
    if (ENV.isPlay) {
      // res.push({ type: 'radio', label: 'Google play', value: 'googleplay', checked: ENV.isPlay})
      res.push({ type: 'radio', label: 'Zarinpal (زرین پال)', value: 'zarinpal', checked: ENV.isPlay });
    }
    if (ENV.isCafe) {
      res.push({ type: 'radio', label: 'Cafebazaar (کافه بازار)', value: 'cafebazaar', checked: ENV.isCafe });
    }
    if (ENV.isAval) {
      res.push({ type: 'radio', label: 'AvvalMarket (اول مارکت)', value: 'avvalmarket', checked: ENV.isAval });
    }
    return res;
  }

  showLoginToast(duration: number) {
    this.toastInstance = this.toastCtrl.create({
      message: this.pleaseLoginLabel,
      duration: duration,
      position: 'middle',
      showCloseButton: true,
      closeButtonText: this.loginLabel,
      dismissOnPageChange: true
    });
    this.toastInstance.onDidDismiss((data, role) => {
      if (role === 'close') {
        this.appLogin();
      }
      this.toastInstance = null;
    });
    this.toastInstance.present();
  }

  appLogin() {
    this.loginService.appLogin((data) => {
      this.reCheckMembership();
    }, (error) => {
      // Well didn't work.
    });
  }
  exit() {
    this.viewCtrl.dismiss();
  }

  continueLabel: string;
  cancelLabel: string;
  loginLabel: string;
  pleaseLoginLabel: string;

  initTranslations() {
    this.translateService.get(['CONTINUE', 'CANCEL_BUTTON', 'PLEASE_LOGIN_FIRST', 'LOGIN_BUTTON']).subscribe((translated) => {
      this.continueLabel = translated.CONTINUE;
      this.cancelLabel = translated.CANCEL_BUTTON;
      this.pleaseLoginLabel = translated.PLEASE_LOGIN_FIRST;
      this.loginLabel = translated.LOGIN_BUTTON;
    });
  }

}
