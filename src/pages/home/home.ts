import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Platform, ModalController, PopoverController,
         Events, Content, ToastController, AlertController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { Market } from '@ionic-native/market';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import introJs from 'intro.js/intro.js';

import { Principal } from '../../providers/auth/principal.service';
import { Api, Settings, QuestionGenerator, LoginService } from '../../providers';
import { Category, ScoreLookup, Account, Lesson, ScoreTypeFactory } from '../../models';

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
  dailyLesson: Lesson = new Lesson(ScoreTypeFactory.daily, null, null, null, null, 'lesson-daily.jpg');
  mapWidth: number;
  showRetryButton: boolean;
  showUpgradeButton: boolean;
  dailyLessonIsLoading: boolean;
  showHelpHint: boolean = true;
  hideBackward: boolean = true;
  hideForward: boolean = false;
  days: string[] = ['Sun','Mon','Tus','Wed','Thr','Fri','Sat'];
  dayOfWeek: string = this.days[new Date().getDay()];
  dayOfMonth: number = new Date().getDate();

  constructor(private navCtrl: NavController, private principal: Principal,
      private ngZone: NgZone, private market: Market, private events: Events,
      private appVersion: AppVersion, private platform: Platform, private storage: Storage,
      private modalCtrl: ModalController, private elementRef: ElementRef, private api: Api,
      private translateService: TranslateService, private settings: Settings,
      private popoverCtrl: PopoverController, private toastCtrl: ToastController,
      private questionGenerator: QuestionGenerator, private loginService: LoginService,
      private alertCtrl: AlertController) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 6);
  }

  ngOnInit() {
    console.log('Home initalized. ', new Date());
    this.fetchCategories();
    this.appVersion.getVersionCode().then((versionCode) => {
      this.api.versionCode().subscribe((remoteVersion) => {
        console.log('App version code is ', versionCode, ' and remoteVersion ', remoteVersion);
        if (+remoteVersion > +versionCode) {
          this.ngZone.run(() => {
            this.showUpgradeButton = true;
          });
          setTimeout(() => {
            this.alertCtrl.create({
              title: this.labelUpdate,
              message: this.labelNewVersionIsAvaialable,
              buttons: [
                {
                  text: this.labelCancel,
                  role: 'cancel'
                },
                {
                  text: this.labelUpgrade,
                  cssClass: 'btn-success',
                  handler: () => {
                    this.upgrade();
                  }
                }
              ]
            }).present();
          }, 3000);
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
      this.fetchDailyLesson();
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
    }, 2000);
  }

  ionViewWillEnter() {
    const scrollContentDiv = this.elementRef.nativeElement.querySelector('.scroll-content');
    const mapDiv = this.elementRef.nativeElement.querySelector('.map-container');
    setTimeout(() => {
      scrollContentDiv.setAttribute('style', null);  // a fix for auto padding-top and padding-bottom set value.
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
    // introJs().hideHints();
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
    this.showRetryButton = true;
    this.api.getCategoryPublicList(this.settings.learnDir, force).subscribe((response) => {
      this.ngZone.run(() => {
        this.categories = response;
        this.showRetryButton = false;
      });
    }, (error) => {
      console.log('Fetching CategoryList actually failed with: ', error);
      this.showRetryButton = true;
    });
  }

  fetchDailyLesson() {
    this.dailyLessonIsLoading = true;
    this.api.getDailyLesson().subscribe((dl: Lesson) => {
      this.dailyLesson = new Lesson(ScoreTypeFactory.daily, dl.uuid, dl.title, this.settings.learnDir, dl.indexOrder, dl.picture);
      console.log('DailyLesson ', this.dailyLesson);
      this.settings.dailyLessonPictureUrl = this.dailyLesson.pictureUrl;
      this.dailyLessonIsLoading = false;
    });
  }

  retry() {
    window.location.reload();
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
      if (category.commingSoon) {
        this.toastCtrl.create({ message: this.labelSoon, duration: 1000, position: 'middle' }).present();
      } else {
        this.navCtrl.push('CategoryLessonPage', { category: category });
      }
    }
  }

  startDailyLesson() {
    if (this.principal.isAuthenticated()) {
      this.dailyLessonIsLoading = true;
      this.api.getWords(this.dailyLesson.uuid, this.settings.learnDir).subscribe((res) => {
        if (res.words.lenth === 0) {
          this.toastCtrl.create({ message: 'Incorrect format', duration: 3000, position: 'middle' }).present();
          return;
        }
        console.log('recievied words response : ', res.words);
        const questions = this.questionGenerator.generate(res.words, this.settings.difficultyLevel, true);
        console.log('Generated questions were : ', questions);
        this.navCtrl.push('LessonQuestionPage', {
          lesson: this.dailyLesson,
          questions: questions,
          words: res.words}).then(() => {
            this.dailyLessonIsLoading = false;
          });
      }, (error) => {
        console.log('Oops this should not happend, TODO');
        this.dailyLessonIsLoading = false;
      });
    } else {
      let toastInstance = this.toastCtrl.create({
        message: this.pleaseLoginLabel, duration: 3000, position: 'middle',
        showCloseButton: true, closeButtonText: this.loginLabel, dismissOnPageChange: true
      });
      toastInstance.onDidDismiss((data, role) => {
        if (role === 'close') {
          this.loginService.appLogin(data => {
          }, (error) => {
          });
        }
        toastInstance = null;
      });
      toastInstance.present();
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
      this.fetchDailyLesson();
    });
    popover.present({ ev: $event });
  }

  numberOfLessonsForCategoryByIndex(index) {
    if (index === 24 || index === 15 || index === 16 || index === 17) {
      return 7;
    } else if (index === 18 || index === 19 || index === 20 || index === 21) {
      return 6;
    } else {
      return 8;
    }
  }

  showHelp() {
    const intro = introJs();
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
    const intro = introJs();
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
  labelSoon: string;
  loginLabel: string;
  pleaseLoginLabel: string;
  labelUpdate: string;
  labelUpgrade: string;
  labelNewVersionIsAvaialable: string;
  labelCancel: string;

  initTranslations() {
    return new Observable((observer) => {
       this.translateService.get(['OK', 'FOR_START_CLICK_ON_THE_PICTURE', 'NEXT', 'PREV',
                                 'CLICK_HERE_TO_SEE_GUIDE', 'TO_THE_RIGHT',
                                 'AND_CONTINUE_YOUR_PATH', 'SOON_LABEL',
                                 'PLEASE_LOGIN_FIRST', 'LOGIN_BUTTON', 'CANCEL_BUTTON',
                                 'UPDATE', 'UPGRADE', 'NEW_VERSION_IS_AVAILABLE']).subscribe((translated) => {
        this.labelOk = translated.OK;
        this.labelNext = translated.NEXT;
        this.labelPrev = translated.PREV;
        this.labelStartFromHere = translated.FOR_START_CLICK_ON_THE_PICTURE;
        this.labelClickHereToSeeInstructions = translated.CLICK_HERE_TO_SEE_GUIDE;
        this.labelAndContinueYourPath = translated.AND_CONTINUE_YOUR_PATH;
        this.labelToTheRight = translated.TO_THE_RIGHT;
        this.labelSoon = translated.SOON_LABEL;
        this.loginLabel = translated.LOGIN_BUTTON;
        this.pleaseLoginLabel = translated.PLEASE_LOGIN_FIRST;
        this.labelUpdate = translated.UPDATE;
        this.labelUpgrade = translated.UPGRADE;
        this.labelNewVersionIsAvaialable = translated.NEW_VERSION_IS_AVAILABLE;
        this.labelCancel = translated.CANCEL_BUTTON;
        observer.next(translated);
        observer.complete();
      });
    });
  }

}
