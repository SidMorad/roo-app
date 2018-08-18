import { Injectable } from '@angular/core';
import { App, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Principal, Api, Settings, QuestionGenerator } from '../';
import { Lesson, ScoreTypeFactory } from '../../models';

@Injectable()
export class CategoryService {

  categoryIdentityMap: any;

  constructor(private principal: Principal, private app: App,
    private toastCtrl: ToastController, private api: Api, private settings: Settings,
    private translateService: TranslateService, private questionGenerator: QuestionGenerator) {
      this.initTranslations();
  }

  openCategory(categoryUuid) {
    if (!this.categoryIdentityMap) {
      this.initalizeCategoryIdentityMap().subscribe(res => {
        this.categoryIdentityMap = {};
        res.forEach(cat => {
          this.categoryIdentityMap[cat['uuid']] = cat;
        });
        this.openCategoryWhenIdentityMapLoaded(categoryUuid);
      });
    } else {
      this.openCategoryWhenIdentityMapLoaded(categoryUuid);
    }
  }

  openLesson(lessonSearch: any) {
    if(!this.categoryIdentityMap) {
      this.initalizeCategoryIdentityMap().subscribe(res => {
        this.categoryIdentityMap = {};
        res.forEach(cat => {
          this.categoryIdentityMap[cat['uuid']] = cat;
        });
        this.openLessonWhenIdentityMapLoaded(lessonSearch);
      });
    } else {
      this.openLessonWhenIdentityMapLoaded(lessonSearch);
    }
  }

  private openLessonWhenIdentityMapLoaded(lessonSearch: any) {
    const category = this.categoryIdentityMap[lessonSearch.cUuid];
    this.principal.identity().then(account => {
      if ((!account || !account.member) && category.forSell) {
        this.app.getActiveNav().push('SubscribePage');
        lessonSearch.isLoading = false;
      }
      else {
        if (category.commingSoon) {
          this.showCommingSoonToast();
          lessonSearch.isLoading = false;
        }
        else {
          this.openLessonByLessonSearch(lessonSearch);
        }
      }
    });
  }

  private openLessonByLessonSearch(lessonSearch: any) {
    this.api.getWords(lessonSearch.lUuid, this.settings.learnDir).subscribe(res => {
      const lesson: Lesson = new Lesson(ScoreTypeFactory.lesson, lessonSearch.lUuid, null, this.settings.learnDir, lessonSearch.lIndex, null);
      if (res.words.length === 0) {
        this.showCommingSoonToast();
        lessonSearch.isLoading = false;
        return;
      }
      const questions = res.questions.length === 0 ? this.questionGenerator.generate(res.words, this.settings.difficultyLevel) : res.questions;
      this.app.getActiveNav().push('LessonQuestionPage', {
        category: this.categoryIdentityMap[lessonSearch.cUuid],
        lesson: lesson, questions: questions, words: res.words
      }).then(() => {
        lessonSearch.isLoading = false;
      }).catch(() => {
        lessonSearch.isLoading = false;
      });
    }, error => {
      console.log('Oops this should not happen, TODO');
      lessonSearch.isLoading = false;
    });
  }

  private openCategoryWhenIdentityMapLoaded(categoyUuid: string) {
    const category = this.categoryIdentityMap[categoyUuid];
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

  showCommingSoonToast() {
    this.toastCtrl.create({
      message: this.labelSoon,
      duration: 1000,
      position: 'middle'
    }).present();
  }

  initalizeCategoryIdentityMap() {
    return this.api.getCategoryPublicList(this.settings.learnDir);
  }

  labelSoon: string;
  initTranslations() {
    this.translateService.get(['SOON_LABEL']).subscribe(translated => {
      this.labelSoon = translated.SOON_LABEL;
    });
  }
}