import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Platform, ModalController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { Storage } from '@ionic/storage';

import { Principal } from '../../providers/auth/principal.service';
import { Api } from '../../providers/api/api';
import { Category, TranslDir, ScoreLookup, Account } from '../../models';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('panel', { read: ElementRef}) public panel: ElementRef;
  account: Account = {};
  categories: Category[];
  mapWidth: number;
  showRetryButton: boolean;
  showUpgradeButton: boolean;

  constructor(private navCtrl: NavController,
              private principal: Principal,
              private ngZone: NgZone, private market: Market,
              private api: Api, private appVersion: AppVersion,
              public platform: Platform,
              private storage: Storage,
              private modalCtrl: ModalController) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 4.8);
  }

  ngOnInit() {
    console.log('Home initalized. ', new Date());
    this.fetchCategories();
    // this.content.enableJsScroll();
    // this.content.resize();
    this.appVersion.getVersionCode().then((versionCode) => {
      this.api.versionCode().subscribe((remoteVersion) => {
        console.log('App version code is ', versionCode, ' and remoteVersion ', remoteVersion);
        if (remoteVersion > versionCode) {
          this.ngZone.run(() => {
            this.showUpgradeButton = true;
          });
        }
      });
    });
    this.storage.get('LAST_SCORE').then((scoreStr) => {
      if (scoreStr) {
        this.modalCtrl.create('LessonScorePage').present();
      }
    });
  }

  ionViewWillEnter() {
    this.principal.identity().then((account) => {
      this.ngZone.run(() => {
        this.account = account === null ? {} : account;
      });
      // this.app.getRootNavs()[0].setRoot(FirstRunPage);
    });
  }

  doneLessons(category) {
    if (this.scoreLookup().categoryMap[category.uuid]) {
      return this.scoreLookup().categoryMap[category.uuid];
    }
    return 0;
  }

  scoreLookup(): ScoreLookup {
    if (this.api.cachedScoreLookup) {
      return this.api.cachedScoreLookup;
    }
    return new ScoreLookup(0, TranslDir.FA$EN_UK, {}, {});
  }

  fetchCategories() {
    this.showRetryButton = false;
    this.api.getCategoryPublicList(TranslDir.FA$EN_UK).subscribe((response) => {
      this.ngZone.run(() => {
        this.categories = response;
      });
    }, (error) => {
      this.showRetryButton = true;
    });
  }

  scrollToTheRight() {
    this.panel.nativeElement.scrollLeft += window.screen.width;
  }

  categoryLesson(category: Category) {
    if (!this.account.member && category.forSell) {
      this.navCtrl.push('SubscribePage');
    }
    else {
      this.navCtrl.push('CategoryLessonPage', { category: category });
    }
  }

  upgrade() {
    this.market.open('mars.roo');
  }

  dailyLesson() {
  }

}
