import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, AlertController, ViewController, Content } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';

import { Category, Lesson, Question } from '../../models';

@IonicPage()
@Component({
  selector: 'page-lesson-question',
  templateUrl: 'lesson-question.html'
})
export class LessonQuestionPage implements OnInit {
  @ViewChild(Content) content: Content;

  lesson: Lesson;
  category: Category;
  questions: Question[];
  question: Question;
  dir: string = 'ltr';
  title: string;
  questionCounter: number;
  options: any[];
  chosens: any[];
  choices: any[];
  fourPictures: any[];
  twoPictures: any[];
  fourPictureAnsweredCount: number;
  fourPictureQuestionArray: any[];
  twoPictureCorrectIndex: number;
  isChecking: boolean;
  noCorrect: number = 0;
  noWrong: number = 0;
  writingAnswer: string;
  wasCorrect: boolean;
  wasWrong: boolean;

  constructor(platform: Platform, navParams: NavParams, private alertCtrl: AlertController,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private dragulaService: DragulaService) {
    this.dir = platform.dir();
    const l: Lesson = navParams.get('lesson');
    this.lesson = new Lesson(l.uuid, l.title, l.translDir, l.translDir);
    this.category = navParams.get('category');
    this.questions = navParams.get('questions');
  }

  ngOnInit() {
    const arrow = this.dir === 'ltr' ? ' > ' : ' < ';
    this.title = this.category.title + arrow + this.lesson.title;
    // this.questionCounter = -1;
    this.questionCounter = 0;
    this.goToNextQuestion();
    this.dragulaService.drag.subscribe(value => {
      console.log('Dragging the ', value);
    })
    this.dragulaService.drop.subscribe(value => {
      if (this.isType('FourPicture')) {
        if (value[1].name) {
          if (value[1].name === value[2].id) {
            this.question.d.pics[value[1].name.split('_')[1]].answered = true;
            if (this.fourPictureAnsweredCount < 3) {
              this.fourPictureAnsweredCount++;
            } else {
              this.check(true); // TODO handle if they did answer wrong.
            }
          }
        }
        if (this.fourPictureAnsweredCount < 3) {
          this.fourPictureQuestionArray = [];
          setTimeout(() => {
            const tindex = this.fourPictures[this.fourPictureAnsweredCount];
            const tpic = this.question.d.pics[tindex];
            tpic.tindex = tindex;
            this.fourPictureQuestionArray = [tpic];
          }, 400);
        }
      } else if (this.isType('TwoPicture')) {
        if (value[1].name) {
          this.twoPictures[value[2].id.split('_')[1]].answered = true;
          if (value[1].name === value[2].id) {
            this.check(true);
          } else {
            this.check(false);
          }
        }
      }
    })
  }

  check(force?:boolean) {
    this.isChecking = true;
    if (this.isAnswerRight(force)) {
      this.wasCorrect = true;
      this.noCorrect++;
    } else {
      this.wasWrong = true;
      this.noWrong++;
    }
    setTimeout(() => {
      this.wasWrong = false;
      this.wasCorrect = false;
      this.goToNextQuestion();
    }, 2000);
  }

  isAnswerRight(force?: boolean) {
    if (this.isType('MultiSelect')) {
      if (this.question.d.answers.length === this.chosens.length) {
        for (let i = 0; i < this.question.d.answers.length; i++) {
          if (this.question.d.answers[i].text !== this.chosens[i].text) {
            return false;
          }
        }
        return true;
      }
    }
    else if (this.isType('TwoPicture') || this.isType('FourPicture')) {
      return force;
    }
    else if (this.isType('MultiCheck')) {
      for (let i = 0; i < this.choices.length; i++) {
        if (this.choices[i].isCorrect) {
          if (!this.choices[i].picked) {
            return false;
          }
        } else {
          if (this.choices[i].picked) {
            return false;
          }
        }
      }
      return true;
    }
    else if (this.isType('OneCheck')) {
      for (let i = 0; i < this.choices.length; i++) {
        if (this.choices[i].isCorrect) {
          if (this.choices[i].picked === i + 1) {
            return true;
          }
        }
      }
      return false;
    }
    else if (this.isType('Writing')) {
      let actual = this.writingAnswer.replace(/\s+/g, ' ').trim().toUpperCase();
      for (let i = 0; i < this.question.d.answers.length; i++) {
        let expected = this.question.d.answers[i].text.replace(/\s+/g, ' ').trim().toUpperCase();
        if (actual === expected) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  isAnswered() {
    if (this.question) {
      if (this.isType('MultiSelect')) {
        return this.chosens.length > 0
      } else if (this.isType('MutliCheck') || this.isType('OneCheck')) {
        for (let i = 0; i < this.choices.length; i++) {
          if (this.choices[i].picked) {
            return true;
          }
        }
      }
    }
    return false;
  }

  oneChecked(index) {
    console.log('oneChecked called!');
    for (let i = 0; i < this.choices.length; i++) {
      delete this.choices[i].picked;
    }
    this.choices[index].picked = index + 1;
  }

  moveToChosen(item) {
    // this.speak(item.text); // TODO
    this.chosens.push(item);
    this.options.splice(this.options.indexOf(item), 1);
  }

  moveBackToOptions(item) {
    this.options.push(item);
    this.chosens.splice(this.chosens.indexOf(item), 1);
  }

  isType(type: string): boolean {
    return this.question.type.toString() === type;
  }

  isNotTypes(types: string[]): boolean {
    let result = true;
    for (let i = 0; i < types.length; i++) {
      if (this.isType(types[i])) {
        result = false;
      }
    }
    return result;
  }

  goToNextQuestion() {
    this.questionCounter++;
    this.isChecking = false;
    if (this.questionCounter === this.questions.length - 1) {
      // Well end of questionary.
      console.log('END! TODO');
    } else {
      this.setQuestion(this.questions[this.questionCounter]);
    }
  }

  setQuestion(question: Question) {
    this.question = question;
    try {
      this.question.d = JSON.parse(question.dynamicPart);
    } catch(error ) { console.log('Oops, error on parse dynamicPart ', question.dynamicPart) };
    try {
      this.question.b = JSON.parse(question.binaryPart);
    } catch(error ) { console.log('Oops, error on parse binaryPart ', question.binaryPart) };
    console.log('TYPE', question.type.toString());
    if (this.isType('MultiSelect')) {
      this.options = this.question.d.options.slice();
      this.chosens = [];
    } else if (this.isType('OneCheck')) {
      this.choices = this.question.d.choices.slice();
      console.log('CHOCIES', this.choices);
    } else if (this.isType('FourPicture')) {
      this.fourPictures = this.shuffleArray([0, 1, 2, 3]);
      this.fourPictureAnsweredCount = 0;
      const tindex = this.fourPictures[this.fourPictureAnsweredCount];
      const tpic = this.question.d.pics[tindex];
      tpic.tindex = tindex;
      this.fourPictureQuestionArray = [tpic];
      this.content.scrollToBottom();
    } else if (question.type.toString() === 'TwoPicture') {
      question.d.correct.picture = question.b.correct.picture;
      question.d.correct.pictureContentType = question.b.correct.pictureContentType;
      question.d.wrong.picture = question.b.wrong.picture;
      question.d.wrong.pictureContentType = question.b.wrong.pictureContentType;
      if (Math.floor(Math.random() * 2) === 1) {
        this.twoPictureCorrectIndex  = 0;
        this.twoPictures = [question.d.correct, question.d.wrong];
      } else {
        this.twoPictureCorrectIndex  = 1;
        this.twoPictures = [question.d.wrong, question.d.correct];
      }
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
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