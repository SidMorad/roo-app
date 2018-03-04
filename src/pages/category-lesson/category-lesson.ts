import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, Slides, NavController } from 'ionic-angular';
import { NgProgress } from '@ngx-progressbar/core';
import { Subscription } from 'rxjs/Rx';

import { Category, Lesson, TranslDir } from '../../models';
import { Api } from '../../providers/api/api';

@IonicPage()
@Component({
  selector: 'page-category-lesson',
  templateUrl: 'category-lesson.html'
})
export class CategoryLessonPage implements OnInit {

  @ViewChild(Slides) slides: Slides;

  lessons: Lesson[];
  dir: string = 'ltr';
  category: Category;
  isEnd: boolean;
  isBeginning: boolean;
  subscription: Subscription;

  constructor(platform: Platform, navParams: NavParams, private navCtrl: NavController,
              private api: Api, public ngProgress: NgProgress) {
    this.dir = platform.dir();
    this.category = navParams.get('category');
    this.lessons = [];
  }

  ngOnInit() {
    this.isBeginning = true;
    this.api.getLessonPublicList(TranslDir.FA$EN_UK, this.category.uuid)
      .subscribe((res) => {
        this.lessons = res;
      }, (error) => {
        console.log('Oops category-lesson load failed! TODO');
      });
  }

  startLesson(index) {
    this.subscription = this.api.getQuestions(this.lessons[index]).subscribe((res) => {
      this.navCtrl.push('LessonQuestionPage', {category: this.category, lesson: this.lessons[index], questions: res});
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

}
