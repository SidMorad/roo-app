import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, Slides, NavController, ToastController } from 'ionic-angular';
import { NgProgress } from '@ngx-progressbar/core';
import { Subscription } from 'rxjs/Rx';

import { Category, Lesson, ScoreTypeFactory } from '../../models';
import { Api, Memory, Settings, QuestionGenerator } from '../../providers';

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
  initialIndexToGo: number;

  constructor(public platform: Platform, navParams: NavParams, private navCtrl: NavController,
              private api: Api, public ngProgress: NgProgress, private ngZone: NgZone,
              private memory: Memory, private settings: Settings, private toastCtrl: ToastController,
              private questionGenerator: QuestionGenerator) {
    this.category = navParams.get('category');
    this.lessons = [];
  }

  ngOnInit() {
    this.isBeginning = true;
    this.api.getLessonPublicList(this.settings.difficultyLevel, this.category.uuid).subscribe((res) => {
      this.lessons = res;
      this.initialIndexToGo = 0;
      for (let i = 0; i < this.lessons.length; i++) {
        const noStars = this.starLookup(this.lessons[i]);
        console.log('Iterator ', i , ' noStars: ', noStars);
        if (!noStars || noStars !== 5) {
          i = this.lessons.length;
          if (this.initialIndexToGo) {
            setTimeout(() => {
              if (this.initialIndexToGo) {
                this.goToSlide(this.initialIndexToGo);
              }
            }, 300);
          }
        } else {
          this.initialIndexToGo++;
        }
      }
      let numberOfDoneLessons = 0;
      for (let i = 0; i < this.lessons.length; i++) {
        const noStars = this.starLookup(this.lessons[i]);
        if (noStars)
          numberOfDoneLessons++;
      }
      this.memory.setNumberOfDoneLessons(numberOfDoneLessons);
    }, (error) => {
      console.log('Oops category-lesson load failed! TODO');
    });
  }

  ngAfterViewInit() {
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.renderPaginationBulletRender();
      this.slides.update();
      this.slides.resize();
    }, 300);
    if (this.memory.isLessonDoneSuccessfully() && !this.isEnd) {
      const currentIndex = this.slides.getActiveIndex();
      setTimeout(() => {
        if (currentIndex === this.slides.getActiveIndex()) {
          this.slides.slideNext(1000);
        }
      }, 1000);
      this.memory.setLessonDoneSuccessfully(false);
    }
    console.log('Number of done lessons was ', this.memory.getNumberOfDoneLessons());
    if (this.memory.isLessonDoneSuccessfully() && this.memory.getNumberOfDoneLessons() === 7) {
      this.navCtrl.push('CategoryCompletePage', { category: this.category });
      this.memory.setNumberOfDoneLessons(0);
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
    this.subscription = this.api.getQuestions(this.lessons[index].uuid,
                                              this.settings.learnDir,
                                              this.settings.difficultyLevel).subscribe((res) => {
      const lesson: Lesson = new Lesson(ScoreTypeFactory.lesson, this.lessons[index].uuid, null, this.settings.learnDir, this.lessons[index].indexOrder, null);
      if (res.words.length === 0) {
        this.toastCtrl.create({
          message: 'Incorrect format',
          duration: 3000
        }).present();
        return;
      }
      const questions = res.questions.length === 0 ? this.questionGenerator.generate(res.words, this.settings.difficultyLevel) : res.questions;
      this.navCtrl.push('LessonQuestionPage', {
        category: this.category,
        lesson: lesson,
        questions: questions,
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
    this.ngZone.run(() => {
      this.slides.slideTo(index);
    });
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

  titleKey(lesson) {
    const l = new Lesson(ScoreTypeFactory.lesson, lesson.uuid, null, null, lesson.indexOrder, null);
    return l.titleKey;
  }

}
