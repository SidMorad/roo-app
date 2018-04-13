import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Platform, ModalController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import introJs from 'intro.js/intro.js';

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
  showHelpHint: boolean = true;

  constructor(private navCtrl: NavController, private principal: Principal,
              private ngZone: NgZone, private market: Market,
              private api: Api, private appVersion: AppVersion,
              public platform: Platform, private storage: Storage,
              private modalCtrl: ModalController, private elementRef: ElementRef,
              private translateService: TranslateService) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 6);
    this.initTranslations();
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

  ngAfterViewInit() {
    let scrollContentDiv = this.elementRef.nativeElement.querySelector('.scroll-content');
    setTimeout(() => {
      scrollContentDiv.style = null;  // a fix for auto padding-top and padding-bottom set value.
    }, 400);
    setTimeout(() => {
      if (this.showHelpHint) {
        const intro = introJs.introJs();
        intro.setOptions({
          hints: [
            { hint: this.labelClickHereToSeeInstructions, element: '#helpButton', hintPosition: 'middle-middle'}
          ],
          hintButtonLabel: this.labelOk
        });
        intro.showHints();
      }
    }, 2000);
  }

  ionViewWillEnter() {
    this.principal.identity().then((account) => {
      this.ngZone.run(() => {
        this.account = account === null ? {} : account;
      });
      // this.app.getRootNavs()[0].setRoot(FirstRunPage);
    });
  }

  ionViewWillLeave() {
    introJs.introJs().hideHints();
  }

  doneLessons(category) {
    if (this.scoreLookup().categoryMap[category.uuid]) {
      setTimeout(() => {
        this.showHelpHint = false;
      }, 0);
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

  showHelp() {
    const intro = introJs.introJs();
    intro.setOptions({
      steps: [
        { element: '#pin-1', intro: this.labelStartFromHere, position: 'auto' },
        { element: '#pin-22' , intro: this.labelAndContinueYourPath, position: 'auto'},
        { element: '#pin-2' , intro: this.labelToTheRight, position: 'auto'}
      ],
      showStepNumbers: false,
      exitOnOverlayClick: true,
      exitOnEsc:true,
      nextLabel: this.labelNext,
      prevLabel: this.labelPrev,
      skipLabel: this.labelOk,
      doneLabel: this.labelOk
    });
    intro.start();
  }

  dailyLesson() {
  }

  labelOk: string;
  labelNext: string;
  labelPrev: string;
  labelStartFromHere: string;
  labelClickHereToSeeInstructions: string;
  labelAndContinueYourPath: string;
  labelToTheRight: string;

  initTranslations() {
    this.translateService.get(['OK', 'FOR_START_CLICK_ON_THE_PICTURE', 'NEXT', 'PREV',
                               'CLICK_HERE_TO_SEE_INSTRUCTIONS', 'TO_THE_RIGHT',
                               'AND_CONTINUE_YOUR_PATH']).subscribe((translated) => {
      this.labelOk = translated.OK;
      this.labelNext = translated.NEXT;
      this.labelPrev = translated.PREV;
      this.labelStartFromHere = translated.FOR_START_CLICK_ON_THE_PICTURE;
      this.labelClickHereToSeeInstructions = translated.CLICK_HERE_TO_SEE_INSTRUCTIONS;
      this.labelAndContinueYourPath = translated.AND_CONTINUE_YOUR_PATH;
      this.labelToTheRight = translated.TO_THE_RIGHT;
    });
  }

}
