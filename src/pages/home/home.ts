import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Platform, ModalController, PopoverController, Events, Content } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import introJs from 'intro.js/intro.js';

import { Principal } from '../../providers/auth/principal.service';
import { Api, Settings } from '../../providers';
import { Category, ScoreLookup, Account } from '../../models';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('panel', { read: ElementRef}) public panel: ElementRef;
  @ViewChild(Content) content: Content;

  account: Account = {};
  categories: Category[];
  mapWidth: number;
  showRetryButton: boolean;
  showUpgradeButton: boolean;
  showHelpHint: boolean = true;
  hideBackward: boolean = true;
  hideForward: boolean = false;

  constructor(private navCtrl: NavController, private principal: Principal,
              private ngZone: NgZone, private market: Market,
              private api: Api, private appVersion: AppVersion,
              private platform: Platform, private storage: Storage,
              private modalCtrl: ModalController, private elementRef: ElementRef,
              private translateService: TranslateService, private settings: Settings,
              private popoverCtrl: PopoverController, private events: Events) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 6);
  }

  ngOnInit() {
    console.log('Home initalized. ', new Date());
    this.fetchCategories();
    // this.content.enableJsScroll();
    // this.content.resize();
    this.appVersion.getVersionCode().then((versionCode) => {
      this.api.versionCode().subscribe((remoteVersion) => {
        console.log('App version code is ', versionCode, ' and remoteVersion ', remoteVersion);
        if (+remoteVersion > +versionCode) {
          this.ngZone.run(() => {
            this.showUpgradeButton = true;
          });
        }
      });
    });
    if (this.principal.isAuthenticated()) {
      this.storage.get('LAST_SCORE').then((scoreStr) => {
        if (scoreStr) {
          this.modalCtrl.create('LessonScorePage').present();
        }
      });
      this.settings.load().then(() => {
        if (!this.settings.allSettings.profileFirstLoaded) {
          this.showHelpHint = false;
          this.navCtrl.push('ProfileFirstPage');
        }
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initTranslations().subscribe((translated) => {
        if (translated['OK'] === 'OK') {  // Oops translatation didn't work as expected!
          console.log('Oops translateService didn\'t initialized correctly! ', this.translateService.currentLang);
          this.events.publish('INIT_TRANSLATIONS');
          this.navCtrl.push('TabsPage').then(() => {
            const index = this.navCtrl.getActive().index;
            this.navCtrl.remove(0, index);
          });
        }
      });
      if (this.showHelpHint) {
        this.showHelpHintHint();
      }
    }, 4000);
  }

  ionViewWillEnter() {
    const scrollContentDiv = this.elementRef.nativeElement.querySelector('.scroll-content');
    const mapDiv = this.elementRef.nativeElement.querySelector('.map-container');
    setTimeout(() => {
      scrollContentDiv.style = null;  // a fix for auto padding-top and padding-bottom set value.
      if (mapDiv.scrollLeft === 0) {
        mapDiv.scrollLeft += 38;
      }
    }, 400);
    this.principal.identity().then((account) => {
      this.ngZone.run(() => {
        this.account = account === null ? {} : account;
      });
      // this.app.getRootNavs()[0].setRoot(FirstRunPage);
    });
  }

  ionViewDidEnter() {
    if (this.showHelpHint) {
      this.showHelpHintHint();
    }
    this.settings.loadCachedScoreLookups();
  }

  ionViewWillLeave() {
    introJs.introJs().hideHints();
  }

  doneLessons(category) {
    if (this.scoreLookup().categoryMap[category.uuid]) {
      this.showHelpHint = false;
      return this.scoreLookup().categoryMap[category.uuid];
    }
    return 0;
  }

  scoreLookup(): ScoreLookup {
    if (this.settings.cachedScoreLookup) {
      return this.settings.cachedScoreLookup;
    }
    return new ScoreLookup(0, null, null, {}, {});
  }

  get flag() {
    if (this.settings.learnDir) {
      return this.settings.learnDir.split('$')[1].split('_')[1].toLowerCase();
    } else {
      return 'gb';
    }
  }

  fetchCategories(force?: boolean) {
    this.showRetryButton = false;
    this.api.getCategoryPublicList(this.settings.learnDir, force).subscribe((response) => {
      this.ngZone.run(() => {
        this.categories = response;
      });
    }, (error) => {
      this.showRetryButton = true;
    });
  }

  scrollToTheRight() {
    this.panel.nativeElement.scrollLeft += window.screen.width - 30;
    if (this.panel.nativeElement.scrollLeft >= (this.mapWidth - window.screen.width)) {
      this.hideForward = true;
    }
    this.hideBackward = false;
  }

  scrollToTheLeft() {
    this.panel.nativeElement.scrollLeft -= window.screen.width - 30;
    if (this.panel.nativeElement.scrollLeft <= 0) {
      this.hideBackward = true;
    }
    this.hideForward = false;
  }

  // scrollToTheFarLeft() {
  //   console.log('Scroll to far left triggered.');
  //   this.panel.nativeElement.scrollLeft = 0;
  //   this.hideBackward = true;
  // }
  //
  // scrollToTheFarRight() {
  //   console.log('Scroll to far right triggered.');
  //   this.panel.nativeElement.scrollLeft = this.mapWidth - window.screen.width;
  //   this.hideForward = true;
  // }

  lastTimeScreenTouched: number;
  touchMove1($event) {
    this.hideBackward = true;
    this.hideForward = true;
    this.lastTimeScreenTouched = new Date().getTime();
  }

  touchEnd1($event) {
    setTimeout(() => {
      if (this.lastTimeScreenTouched && new Date().getTime() - this.lastTimeScreenTouched > 1999) {
        if (this.panel.nativeElement.scrollLeft > 0) {
          this.hideBackward = false;
        }
        if (this.panel.nativeElement.scrollLeft < (this.mapWidth - window.screen.width)) {
          this.hideForward = false;
        }
      }
    }, 2000);
  }

  categoryLesson(category: Category) {
    if (!this.account.member && category.forSell) {
      this.navCtrl.push('SubscribePage');
    }
    else {
      this.navCtrl.push('CategoryLessonPage', { category: category });
    }
  }

  get isAuthenticated(): boolean {
    return this.principal.isAuthenticated();
  }

  get isRTL(): boolean {
    return this.platform.isRTL;
  }

  upgrade() {
    this.market.open('mars.roo');
  }

  presentPopover($event) {
    const popover = this.popoverCtrl.create('LearnDirPopover');
    popover.onDidDismiss(() => {
      console.log('Popover#onDidDismiss');
      this.content.resize();
      this.settings.loadCachedScoreLookups(true);
      this.fetchCategories(true);
    });
    popover.present({ ev: $event });
  }

  showHelp() {
    const intro = introJs.introJs();
    intro.setOptions({
      steps: [
        { element: '#pin-1', intro: this.labelStartFromHere, position: 'auto' },
        { element: '#pin-22' , intro: this.labelAndContinueYourPath, position: 'auto'},
        { element: '#helpButton' , intro: this.labelToTheRight, position: 'auto'}
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

  showHelpHintHint() {
    const intro = introJs.introJs();
    intro.setOptions({
      hints: [
        { hint: this.labelClickHereToSeeInstructions, element: '#helpButton', hintPosition: 'middle-middle'}
      ],
      hintButtonLabel: this.labelOk
    });
    // intro.showHints(); don't show hint for now. //TODO either make it work as expected or remove hint.
  }

  labelOk: string;
  labelNext: string;
  labelPrev: string;
  labelStartFromHere: string;
  labelClickHereToSeeInstructions: string;
  labelAndContinueYourPath: string;
  labelToTheRight: string;

  initTranslations() {
    return new Observable((observer) => {
       this.translateService.get(['OK', 'FOR_START_CLICK_ON_THE_PICTURE', 'NEXT', 'PREV',
                                 'CLICK_HERE_TO_SEE_GUIDE', 'TO_THE_RIGHT',
                                 'AND_CONTINUE_YOUR_PATH']).subscribe((translated) => {
        this.labelOk = translated.OK;
        this.labelNext = translated.NEXT;
        this.labelPrev = translated.PREV;
        this.labelStartFromHere = translated.FOR_START_CLICK_ON_THE_PICTURE;
        this.labelClickHereToSeeInstructions = translated.CLICK_HERE_TO_SEE_GUIDE;
        this.labelAndContinueYourPath = translated.AND_CONTINUE_YOUR_PATH;
        this.labelToTheRight = translated.TO_THE_RIGHT;
        observer.next(translated);
        observer.complete();
      });
    });
  }

}
