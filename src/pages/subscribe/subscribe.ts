import { Component, NgZone } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController,
         ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { BrowserTab } from '@ionic-native/browser-tab';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Principal, Api, LoginService } from '../../providers';
import { SubscribeModel, SubscriptionType, Account } from '../../models';

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

  constructor(platform: Platform, private browserTab: BrowserTab,
              private principal: Principal, private toastCtrl: ToastController,
              private api: Api, private alertCtrl: AlertController, private ngZone: NgZone,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private loginService: LoginService, private inAppBrowser: InAppBrowser) {
    this.initTranslations();
    this.resumeSubscription = platform.resume.subscribe(() => {
      console.log('onResume event occured.');
      this.reCheckMembership();
    });
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
                  handler: () => {
                    let subscribeModel = new SubscribeModel(paymentDescription, subscriptionType);
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
    });
  }

  showLoginToast(duration: number) {
    this.toastInstance = this.toastCtrl.create({
      message: this.pleaseLoginLabel,
      duration: duration,
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

  ionViewDidEnter() {
    this.reCheckMembership();
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
