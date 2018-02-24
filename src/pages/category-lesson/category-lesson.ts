import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, Slides } from 'ionic-angular';

import { Category, Lesson, TranslDir } from '../../models';
import { CategoryService } from '../../providers/category/category.service';

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

  constructor(platform: Platform, navParams: NavParams,
              private categorySerivce: CategoryService) {
    this.dir = platform.dir();
    this.category = navParams.get('category');
    this.lessons = [];
  }

  ngOnInit() {
    console.log("CategoryLessonPage initialized.");
    this.categorySerivce.getLessonPublicList(TranslDir.FA$EN_UK, this.category.uuid)
      .subscribe((res) => {
        this.lessons = res;
      }, (error) => {
        console.log('Oops category-lesson load failed!');
      });
  }

  ionViewDidEnter() {
    this.isBeginning = true;
  }

  start(index) {
    console.log('Start lesson ', index, this.lessons[index]);
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
