import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, Slides, NavController } from 'ionic-angular';
import { NgProgress } from '@ngx-progressbar/core';
import { Subscription } from 'rxjs/Rx';

import { Category, Lesson } from '../../models';
import { Api, Memory, Settings } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-category-lesson',
  templateUrl: 'category-lesson.html'
})
export class CategoryLessonPage implements OnInit {

  @ViewChild(Slides) slides: Slides;

  lessons: Lesson[];
  category: Category;
  isEnd: boolean;
  isBeginning: boolean;
  subscription: Subscription;


  constructor(public platform: Platform, navParams: NavParams, private navCtrl: NavController,
              private api: Api, public ngProgress: NgProgress, private ngZone: NgZone,
              private memory: Memory, private settings: Settings) {
    this.category = navParams.get('category');
    this.lessons = [];
  }

  ngOnInit() {
    this.isBeginning = true;
    this.api.getLessonPublicList(this.settings.difficultyLevel, this.category.uuid).subscribe((res) => {
      this.lessons = res;
    }, (error) => {
      console.log('Oops category-lesson load failed! TODO');
    });
    this.renderPaginationBulletRender();
  }

  ionViewWillEnter() {
    if (this.memory.isLessonDoneSuccessfully() && !this.isEnd) {
      const currentIndex = this.slides.getActiveIndex();
      setTimeout(() => {
        if (currentIndex === this.slides.getActiveIndex()) {
          this.slides.slideNext(1000);
        }
      }, 1000);
    }
  }

  ionViewWillLeave() {
    this.memory.setLessonDoneSuccessfully(false);
  }

  renderPaginationBulletRender() {
    this.ngZone.run(() => {
    this.slides.paginationBulletRender = (index, defaultClass) => {
      // return '<span class="' + defaultClass + '" (click)="goToSlide(' + index + ')">' + (index+1) + '</span>';
      let goldClass = '';
      if (this.starLookup(this.lessons[index]) === 5) {
        goldClass = ' gold-back';
      }
      else if (this.starLookup(this.lessons[index]) !== 0) {
        goldClass = ' silver-back';
      }
      return '<button class="' + defaultClass + goldClass + '" aria-label="Go to slide ' + (index+1) + '" data-slide-index="' + index + '">'
               + (index+1) +
              '</button>';
    };
    });
  }

  startLesson(index) {
    this.subscription = this.api.getQuestions(this.lessons[index],
                                              this.settings.learnDir,
                                              this.settings.difficultyLevel).subscribe((res) => {
      this.navCtrl.push('LessonQuestionPage', {
        category: this.category,
        lesson: this.lessons[index],
        questions: res.questions,
        words: res.words});
    }, (error) => {
      console.log('Oops this should not happend, TODO');
    });
  }

  cancel(index) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  isInProgress() {
    return this.ngProgress.isStarted();
  }

  goToSlide(index) {
    this.slides.slideTo(index);
  }

  onSlideChangeStart(slider) {
    this.isEnd = slider.isEnd();
    this.isBeginning = slider.isBeginning();
  }

  forward() {
    this.slides.slideNext();
  }

  back() {
    this.slides.slidePrev();
  }

  starLookup(lesson) {
    if (this.settings.cachedScoreLookup && lesson) {
      if (this.settings.cachedScoreLookup.lessonMap[lesson.uuid]) {
        return this.settings.cachedScoreLookup.lessonMap[lesson.uuid];
      }
    }
    return 0;
  }

}
