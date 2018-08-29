import { Component, NgZone, Renderer2 } from '@angular/core';
import { IonicPage, InfiniteScroll } from 'ionic-angular';
import { NgProgress } from '@ngx-progressbar/core';

import { Settings, Api, CategoryService, JhiParseLinks } from '../../providers';
import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Lesson, ScoreTypeFactory, LessonSearch } from '../../models';

@IonicPage()
@Component({
  templateUrl: 'lesson-search.html'
})
export class LessonSearchPage {

  searchLang: string;
  searchFlag: string;
  alternFlag: string;
  searchText: string;
  searchResults: any[];
  page: any;
  links: any;
  totalItems: any;

  constructor(private settings: Settings, private api: Api, private ngZone: NgZone,
              private categoryService: CategoryService, private jhiParseLinks:JhiParseLinks,
              private renderer: Renderer2, private ngProgress: NgProgress) {
  }

  ionViewDidLoad() {
    this.page = 0;
    this.links = {
      last: 0
    }
    this.searchText = '';
    this.searchResults = [];
    this.initSearchLangFromSettings();
    this.doSearch();
  }

  ionViewDidEnter() {
    this.initSearchLangFromSettings();
  }


  ionInput($event) {
    this.page = 0;
    this.doSearch(this.searchText);
  }

  ionCancel() {
    this.page = 0;
    this.searchText = '';
    this.searchResults = [];
    this.doSearch();
  }

  doSearch(searchText?: string, isOnScroll?: boolean, infiniteScroll?: InfiniteScroll) {
  this.ngZone.run(() => {
    let options = {
      page: this.page,
      'lessonDifficLevel.equals': this.settings.difficultyLevel,
      'language.equals': `${this.searchLang}_${this.searchFlag.toUpperCase()}`,
      sort: 'categoryIndexOrder,lessonIndexOrder'
    };
    if (searchText) {
      options['text.contains'] = searchText;
    }
    this.api.searchLesson(this.settings.learnDir, options).subscribe((res) => {
      console.log('Full response: ', res);
      this.links = this.jhiParseLinks.parse(res.headers.get('link'));
      this.totalItems = res.headers.get('X-Total-Count');
      if(!isOnScroll) {
        this.searchResults = [];
        this.dividers = {};
      }
      const data = res.body;
      for (let i = 0; i < data.length; i++) {
        this.searchResults.push(data[i]);
      }
      if (infiniteScroll) {
        console.log('infiniteScroll done, total result size is ', this.searchResults.length, ' links: ', this.links);
        infiniteScroll.complete();
      }
      this.ngProgress.complete();
    });
  });
  }

  doInfinite(infiniteScroll, page) {
    if (this.links['last'] >= this.page) {
      this.page = page;
      this.doSearch(this.searchText, true, infiniteScroll);
    } else {
      infiniteScroll.complete();
    }
  }

  openCategory(categoryUuid: string) {
    this.categoryService.openCategory(categoryUuid);
  }

  openLesson(lessonSearch: LessonSearch) {
    this.categoryService.openLesson(lessonSearch);
  }

  switchSearchLangauge() {
    if (this.searchLang === this.settings.motherLang) {
      this.searchLang = this.settings.targetLang;
      this.searchFlag = this.settings.targetFlag.toLowerCase();
      this.alternFlag = this.settings.motherFlag.toLowerCase();
    } else {
      this.searchLang = this.settings.motherLang;
      this.searchFlag = this.settings.motherFlag.toLowerCase();
      this.alternFlag = this.settings.targetFlag.toLowerCase();
    }
    this.page = 0;
    this.doSearch(this.searchText);
    this.setFocus('.searchbar-input');
  }

  get placeholderKey() {
    return this.searchLang ? `TYPE_HERE_${this.searchLang}` : 'TYPE_HERE';
  }

  starLookup(lesson) {
    if (this.settings.cachedScoreLookup && lesson) {
      if (this.settings.cachedScoreLookup.lessonMap[lesson.lUuid]) {
        return this.settings.cachedScoreLookup.lessonMap[lesson.lUuid];
      }
    }
    return 0;
  }

  lessonTitleKey(lesson): string {
    const l = new Lesson(ScoreTypeFactory.lesson, lesson.lUuid, null, null, lesson.lIndex, null);
    return l.titleKey;
  }

  lessonNumber(lesson): number {
    if (lesson.lIndex <= 60) {
      return lesson.lIndex / 10;
    }
    return null;
  }

  resolveCategoryImageUrl(categoryIndexOrder): string {
    return `${IMAGE_ORIGIN}categories/category-${categoryIndexOrder}.jpeg`;
  }

  dividers = {};
  myHeaderFn = (record, recordIndex, records) => {
    if (!records || !records.length) return null;

    if (this.dividers[record['cUuid']]) {
      return null;
    } else {
      this.dividers[record['cUuid']] = true;
      return record;
    }
  };

  setFocus(selector: string): void {
    this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
            this.renderer.selectRootElement(selector).focus();
        }, 0);
    });
  }

  initSearchLangFromSettings() {
    this.searchLang = this.settings.motherLang;
    this.searchFlag = this.settings.motherFlag.toLowerCase();
    this.alternFlag = this.settings.targetFlag.toLowerCase();
  }

}