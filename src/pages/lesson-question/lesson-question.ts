import { Component, OnInit } from '@angular/core';
import { IonicPage, Platform, NavParams, AlertController, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Category, Lesson, Question } from '../../models';

@IonicPage()
@Component({
  selector: 'page-lesson-question',
  templateUrl: 'lesson-question.html'
})
export class LessonQuestionPage implements OnInit {
  lesson: Lesson;
  category: Category;
  questions: Question[];
  question: Question;
  dir: string = 'ltr';
  title: string;

  constructor(platform: Platform, navParams: NavParams, private alertCtrl: AlertController,
              private translateService: TranslateService, private viewCtrl: ViewController) {
    this.dir = platform.dir();
    const l: Lesson = navParams.get('lesson');
    this.lesson = new Lesson(l.uuid, l.title, l.translDir, l.translDir);
    this.category = navParams.get('category');
    this.questions = navParams.get('questions');
  }

  ngOnInit() {
    console.log('lesson', this.lesson, 'questions', this.questions.length);
    const arrow = this.dir === 'ltr' ? ' > ' : ' < ';
    this.title = this.category.title + arrow + this.lesson.title;
    this.setQuestion(this.questions[0]);
  }

  setQuestion(question: Question) {
    this.question = question;
    try {
      this.question.dynamicPart = JSON.parse(question.dynamicPart);
    } catch(error ) { console.log('Oops, error on parse dynamicPart ', question.dynamicPart) };
    try {
      this.question.binaryPart = JSON.parse(question.binaryPart);
    } catch(error ) { console.log('Oops, error on parse binaryPart ', question.binaryPart) };
  }

  exit() {
    this.translateService.get(['WANT_TO_EXIT_Q', 'NO', 'YES',
                               'ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED']).subscribe(values => {
      this.alertCtrl.create({
        title: values['WANT_TO_EXIT_Q'],
        message: values['ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED'],
        buttons: [
          {
            text: values['NO'],
            role: 'cancel',
            handler: () => { }
          },
          {
            text: values['YES'],
            handler: () => {
              this.viewCtrl.dismiss();
            }
          }
        ]
      }).present();
    });
  }

}