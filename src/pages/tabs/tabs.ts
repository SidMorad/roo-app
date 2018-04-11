import { Component, OnInit, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, Platform, ToastController, IonicApp, Tabs, App, MenuController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';

import { Tab1Root } from '../pages';
import { Tab2Root } from '../pages';
import { Tab3Root } from '../pages';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit, OnDestroy {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;
  @ViewChild(Tabs) tabs: Tabs;

  tab1Title = " ";
  tab2Title = " ";
  tab3Title = " ";
  exitConfirmationText: string;

  langChangeSubscription: Subscription;

  constructor(public navCtrl: NavController, public translateService: TranslateService,
    private ngZone: NgZone, private platform: Platform, private app: App,
    private toastCtrl: ToastController, private ionicApp: IonicApp,
    private menuController: MenuController) {
  }

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((data) => {
      this.initTranslations();
    });
  }

  ionViewWillEnter() {
    this.initTranslations();
  }

  initTranslations() {
    this.translateService.get(['TAB1_TITLE', 'TAB2_TITLE', 'TAB3_TITLE', 'EXIT_CONFIRMATION_TEXT']).subscribe(values => {
      this.ngZone.run(() => {
        this.tab1Title = values.TAB1_TITLE;
        this.tab2Title = values.TAB2_TITLE;
        this.tab3Title = values.TAB3_TITLE;
        this.exitConfirmationText = values.EXIT_CONFIRMATION_TEXT;
      })
    });
  }

  initalizeBackButtonCustomHandler() {
    console.log('backButtonCustomerHandlerCalled.');
    // Handle back button for exit confirmation
    let lastTimeBackPressed = 0;
    const timePeriodToExit = 3000;
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(() => {
      const activePortal = this.ionicApp._loadingPortal.getActive() || // Close If Any Loader Active
        this.ionicApp._modalPortal.getActive() ||  // Close If Any Modal Active
        this.ionicApp._overlayPortal.getActive(); // Close If Any Overlay Active
      const nav = this.app.getActiveNavs()[0];

      if (this.menuController.isOpen()) {
        this.menuController.close();
        console.log('Menu closed!!!');
        return;
      }
      else if (activePortal) {
        activePortal.dismiss();
        console.log('Horrary!!!');
        return;
      }
      else if (nav.canGoBack()) {
        nav.pop();
        console.log('Nav popped!!!');
        return;
      }

      if (nav['root'] && nav['root'] === 'HomePage') {
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
      else {
        this.tabs.select(0);
      }

    });
  }

  ionViewDidLoad() {
    this.initalizeBackButtonCustomHandler();
    console.log('TabsViewDidLoad');
  }

  private unregisterBackButtonAction: any;

  ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    console.log('TabsViewWillLeave');
  }

  ngOnDestroy() {
    console.log('Tabs#ngDestroy');
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

}
