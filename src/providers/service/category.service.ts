import { Injectable } from '@angular/core';
import { App, ToastController, AlertController, Platform, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Principal, Api, Settings, QuestionGenerator } from '../';
import { Lesson, ScoreTypeFactory, LessonSearch } from '../../models';

@Injectable()
export class CategoryService {

  categoryIdentityMap: any;

  constructor(private principal: Principal, private app: App, private platform: Platform,
    private toastCtrl: ToastController, private api: Api, private settings: Settings,
    private translateService: TranslateService, private questionGenerator: QuestionGenerator,
    private alertCtrl: AlertController, private events: Events) {
      this.initTranslations();
      this.platform.ready().then(() => {
        this.initalizeCategoryIdentityMap();
      });
      this.events.subscribe('LEARN_DIR_DIFFIC_LEVEL_SWITCH_EVENT', () => {
        this.initalizeCategoryIdentityMap();
      });
  }

  openCategory(categoryUuid) {
    const category = this.categoryIdentityMap[categoryUuid];
    this.principal.identity().then(account => {
      if ((!account || !account.member) && category.forSell) {
        this.app.getActiveNav().push('SubscribePage');
      }
      else {
        if (category.commingSoon) {
          this.showCommingSoonToast();
        } else {
          this.app.getActiveNav().push('CategoryLessonPage', { category: category });
        }
      }
    });
  }

  openLesson(lessonSearch: LessonSearch) {
    const category = this.categoryIdentityMap[lessonSearch.cUuid];
    this.principal.identity().then(account => {
      if ((!account || !account.member) && category.forSell) {
        this.app.getActiveNav().push('SubscribePage');
      }
      else {
        if (category.commingSoon) {
          this.showCommingSoonToast();
        }
        else {
          this.api.getWords(lessonSearch.lUuid, this.settings.learnDir).subscribe(res => {
            // console.log('Received lesson: ', res);
            const lesson: Lesson = new Lesson(ScoreTypeFactory.lesson, lessonSearch.lUuid, null, this.settings.learnDir, lessonSearch.lIndex, null);
            if (res.words.length === 0) {
              this.showCommingSoonToast();
              return;
            }
            const isok = this.questionGenerator.wordCompletationAnaysis(res.words);
            if (!isok.isOk) {
              this.translateService.get('X_OUT_OF_Y_PHRASES_ARE_COMPLETE_WOULD_YOU_LIKE_TO_TRANSLATE_REMAIN_Z_PHRASES_TO_PROGRESS_FORWARD_WITH_THE_LESSON', { X: isok.done, Y: isok.total, Z: isok.remain }).subscribe(message => {
                this.alertCtrl.create({
                  title: this.labelTranslateIsIncomplete,
                  message: message,
                  buttons: [ { text: this.labelNo, role: 'cancel' },
                  { text: this.labelYes, cssClass: 'btn-success',
                  handler: () => {
                    this.app.getActiveNav().push('LessonWordPage', { words: res.words, lesson: lesson });
                    } } ]
                }).present();
              });
              return;
            }
            const questions = res.questions.length === 0 ? this.questionGenerator.generate(res.words, this.settings.difficultyLevel) : res.questions;
            this.app.getActiveNav().push('LessonQuestionPage', {
              category: this.categoryIdentityMap[lessonSearch.cUuid],
              lesson: lesson, questions: questions, words: res.words
            }).then(() => {
            }).catch(() => {
            });
          }, error => {
            console.log('Oops this should not happen, TODO');
          });
        }
      }
    });
  }

  openReview(lessonSearch: LessonSearch) {
    const category = this.categoryIdentityMap[lessonSearch.cUuid];
    this.principal.identity().then(account => {
      if ((!account || !account.member) && category.forSell) {
        this.app.getActiveNav().push('SubscribePage');
      }
      else {
        if (category.commingSoon) {
          this.showCommingSoonToast();
        }
        else {
          this.api.getWords(lessonSearch.lUuid, this.settings.learnDir).subscribe(res => {
            const lesson: Lesson = new Lesson(ScoreTypeFactory.lesson, lessonSearch.lUuid, null, this.settings.learnDir, lessonSearch.lIndex, null);
            if (res.words.length === 0) {
              this.showCommingSoonToast();
              return;
            }
            this.app.getActiveNav().push('LessonWordPage', { words: res.words, lesson: lesson });
          });
        }
      }
    });
  }

  showCommingSoonToast() {
    this.toastCtrl.create({
      message: this.labelSoon,
      duration: 1000,
      position: 'middle'
    }).present();
  }

  initalizeCategoryIdentityMap() {
    console.log('Initalizing category identityMap...');
    return this.api.getCategoryPublicList(this.settings.learnDir).subscribe(res => {
      this.categoryIdentityMap = {};
      res.forEach(cat => {
        this.categoryIdentityMap[cat['uuid']] = cat;
      });
      console.log('categoryIdentityMap init completed.');
    });
  }

  labelSoon: string;
  labelYes: string;
  labelNo: string;
  labelTranslateIsIncomplete: string;
  initTranslations() {
    this.translateService.get(['SOON_LABEL', 'YES', 'NO', 'TRANSLATE_IS_INCOMPLETE']).subscribe(translated => {
      this.labelSoon = translated.SOON_LABEL;
      this.labelYes = translated.YES;
      this.labelNo = translated.NO;
      this.labelTranslateIsIncomplete = translated.TRANSLATE_IS_INCOMPLETE
    });
  }
}