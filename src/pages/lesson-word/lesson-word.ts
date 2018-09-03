import { Component } from '@angular/core';
import { IonicPage, NavParams, ToastController, Platform, ItemSliding } from 'ionic-angular';

import { Api } from '../../providers';
import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Lesson, CommWordCommand, TranslateCommand } from '../../models';

@IonicPage()
@Component({
  selector: 'lesson-word-page',
  templateUrl: 'lesson-word.html'
})
export class LessonWordPage {

  words: any;
  lesson: Lesson;
  target: any;
  mother: any;
  picList: any[];
  wordList: any[];

  constructor(private api: Api, navParams: NavParams, private platform: Platform,
              private toastCtrl: ToastController) {
    this.lesson = navParams.get('lesson');
    this.words = navParams.get('words');
    const mt = this.lesson.learnDir.split('$');
    this.mother = { flag: mt[0].split('_')[1].toLowerCase(), lang: mt[0].split('_')[0], langCode: mt[0] };
    this.target = { flag: mt[1].split('_')[1].toLowerCase(), lang: mt[1].split('_')[0], langCode: mt[1] };
    this.wordList = []; this.picList = [];
    Object.keys(this.words).map(key => {
      this.wordList.push(this.preEdit(this.words[key]));
    });
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
  }

  wordChangeEvent(item) {
    console.log('WordChangeEvent for ', item);
    if(item.ts[0].u) {
      if (item.ts[0].w && item.ts[0].w.trim().length > 0) {
        this.api.updateCommWord(new CommWordCommand(item.ts[0].u, this.target.langCode, item.ts[0].w.trim())).subscribe(res => {
          item.ts[0].w = res['text'];
        }, err => {
          this.toastCtrl.create({position: 'middle', duration: 2000, message: err.error}).present();
        });
      } else {
        this.api.deleteCommWord(item.ts[0].u).subscribe(res => {
          item.ts[0] = {};
        }, err => {
          console.log(err);
          this.toastCtrl.create({position: 'middle', duration: 2000, message: err.error}).present();
        });
      }
    } else if (item.ts[0].w && item.ts[0].w.trim().length > 0) {
      this.api.createCommWord(new CommWordCommand(item.u, this.target.langCode, item.ts[0].w.trim())).subscribe(res => {
        item.ts[0].u = res['uuid'];
      }, err => {
        this.toastCtrl.create({position: 'middle', duration: 2000, message: err.error}).present();
      });
    }
  }

  preEdit(word) {
    if (word.ts.length === 0) {
      word.ts[0] = {};
      word.open = true;
    } else {
      if (!word.ts[0].a) {  // If current user is not author of first [sorted] record.
        word.ts.unshift({});
      }
      word.openedOnce = true;
    }
    return word;
  }

  translateWithGoogleTranslate(item, itemSliding: ItemSliding) {
    this.api.translateWithGoogleTranslate(new TranslateCommand(
      this.mother.lang.toLowerCase(), this.target.lang.toLowerCase(), item.ms[0].w)).subscribe((res: any) => {
      item.ts[0].w = res.text;
      itemSliding.close();
      this.wordChangeEvent(item);
    }, err => {
      console.error('Translate error: ', err);
      itemSliding.close();
    });
  }

  openItemIfNecessary(item, itemSliding: ItemSliding, itemSlide) {
    if (!item.openedOnce) {
      item.openedOnce = true;
      let swipeAmount = 40; //set your required swipe amount
      itemSliding.startSliding(swipeAmount);
      itemSliding.moveSliding(swipeAmount);

      itemSliding.setElementClass('active-options-right', true);
      itemSliding.setElementClass('active-swipe-right', true);

      itemSlide.setElementStyle('transition', null);
      itemSlide.setElementStyle('transform', this.platform.isRTL ? 'translate3d('+swipeAmount+'px, 0px, 0px)' : 'translate3d(-'+swipeAmount+'px, 0px, 0px)');
    }
  }

  toggleSection(index) {
    console.log('toggleSection called.', this.wordList[index].open);
    this.wordList[index].open = !this.wordList[index].open;
  }

  resolveImageUrl(item) {
    const imageName = item.e.split(' ').join('-');
    return `${IMAGE_ORIGIN}lessons/${imageName}.jpeg`;
  }

  get isRTL(): boolean {
    return this.platform.isRTL;
  }

}