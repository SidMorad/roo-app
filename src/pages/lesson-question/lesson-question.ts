import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, Platform, NavParams, AlertController, ViewController,
        Content, ModalController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Category, Lesson, Question } from '../../models';
import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Principal } from '../../providers/auth/principal.service';
import { LoginService } from '../../providers/login/login.service';

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
  twoPictures: any[];
  fourPictureCorrectIndex: number;
  twoPictureCorrectIndex: number;
  isChecking: boolean;
  noCorrect: number;
  noWrong: number;
  writingAnswer: string;
  wasCorrect: boolean;
  wasWrong: boolean;
  rightAnswerString: string;

  constructor(platform: Platform, navParams: NavParams, private alertCtrl: AlertController,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private principal: Principal, private loginService: LoginService,
              private modalCtrl: ModalController) {
    this.dir = platform.dir();
    const l: Lesson = navParams.get('lesson');
    this.lesson = new Lesson(l.uuid, l.title, l.translDir, l.translDir);
    this.category = navParams.get('category');
    this.questions = navParams.get('questions');
    this.initTranslations();
  }

  ngOnInit() {
    const arrow = this.dir === 'ltr' ? ' > ' : ' < ';
    this.title = this.category.title + arrow + this.lesson.title;
    this.initQuestionary();
  }

  initQuestionary() {
    this.noCorrect = 0;
    this.noWrong = 0;
    this.questionCounter = 0;
    this.goToNextQuestion();
  }

  check() {
    this.isChecking = true;
    if (this.isAnswerRight()) {
      this.wasCorrect = true;
      this.noCorrect++;
      setTimeout(() => {
        this.wasCorrect = false;
        this.goToNextQuestion();
      }, 2000);
    } else {
      this.wasWrong = true;
      this.noWrong++;
    }
    this.resolveRightAnswerString();
  }

  continue() {
    this.wasWrong = false;
    this.goToNextQuestion();
  }

  isAnswerRight() {
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
    else if (this.isType('TwoPicture')) {
      return this.twoPictures[this.twoPictureCorrectIndex].answered;
    }
    else if (this.isType('FourPicture')) {
      return this.question.d.pics[this.fourPictureCorrectIndex].answered;
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
      }
      else if (this.isType('MultiCheck') || this.isType('OneCheck')) {
        for (let i = 0; i < this.choices.length; i++) {
          if (this.choices[i].picked) {
            return true;
          }
        }
      }
      else if (this.isType('TwoPicture')) {
        for (let i = 0; i < 2; i++) {
          if (this.twoPictures[i].answered) {
            return true;
          }
        }
      }
      else if (this.isType('FourPicture')) {
        for (let i = 0; i < 4; i++) {
          if (this.question.d.pics[i].answered) {
            return true;
          }
        }
      }
    }
    return false;
  }

  resolveRightAnswerString() {
    let result = '';
    if (this.isType('MultiSelect')) {
      for (let i = 0; i < this.question.d.answers.length; i++) {
        result += this.question.d.answers[i].text;
        result += " ";
      }
      this.options = [];
      this.chosens = this.question.d.answers;
    }
    else if (this.isType('TwoPicture')) {
      result = this.question.d.correct.answer;
    }
    else if (this.isType('FourPicture')) {
      result = this.question.d.pics[this.fourPictureCorrectIndex].answer;
    }
    else if (this.isType('MultiCheck')) {
      for (let i = 0; i < this.choices.length; i++) {
        if (this.choices[i].isCorrect) {
          result += this.choices[i].text;
          result += "\n<br>";
        }
      }
    }
    else if (this.isType('OneCheck')) {
      for (let i = 0; i < this.choices.length; i++) {
        if (this.choices[i].isCorrect) {
          result = this.choices[i].text;
        }
      }
    }
    else if (this.isType('Writing')) {
      for (let i = 0; i < this.question.d.answers.length; i++) {
        result += this.question.d.answers[i].text;
        if (i != this.question.d.answers.length - 1) {
          result += "<br> or <br>";
        }
      }
    }
    this.rightAnswerString = result;
    return result;
  }

  goToNextQuestion() {
    if (this.questionCounter >= this.questions.length) {
      this.questionCounter++;
      if (!this.principal.isAuthenticated()) {
        this.alertCtrl.create({
          title: this.labelLoginTitle,
          message: this.labelLoginMessage,
          buttons: [
            {
              text: this.labelLoginEscape,
              role: 'cancel',
              handler: () => { this.viewCtrl.dismiss(); }
            },
            {
              text: this.labelLogin,
              handler: () => {
                this.loginService.appLogin((data) => {
                  console.log('GREAT we are logged in!', this.principal.isAuthenticated());
                }, (err) => {
                  console.log('LOGIN FAILURE ', err);
                });
              }
            }
          ]
        }).present();
      } else {
        console.log('DONE TODO send score');
        this.viewCtrl.dismiss();
      }
    } else {
      this.isChecking = false;
      if (this.noWrong === 5) {
        this.showFailureModal();
      } else {
        this.questionCounter++;
        this.setQuestion(this.questions[this.questionCounter-1]);
      }
    }
  }

  setQuestion(question: Question) {
    this.question = question;
    try {
      this.question.d = JSON.parse(question.dynamicPart);
    } catch(error ) { console.log('Oops, error on parse dynamicPart ', question.dynamicPart) };
    console.log('TYPE', question.type.toString());
    if (this.isType('MultiSelect')) {
      this.options = this.question.d.options.slice();
      this.chosens = [];
    } else if (this.isType('OneCheck')) {
      this.choices = this.question.d.choices.slice();
    } else if (this.isType('FourPicture')) {
      let fourPictures = this.shuffleArray([0, 1, 2, 3]);
      this.fourPictureCorrectIndex = fourPictures[2];
      this.content.scrollToBottom();
    } else if (question.type.toString() === 'TwoPicture') {
      if (Math.floor(Math.random() * 2) === 1) {
        this.twoPictureCorrectIndex  = 0;
        this.twoPictures = [question.d.correct, question.d.wrong];
      } else {
        this.twoPictureCorrectIndex  = 1;
        this.twoPictures = [question.d.wrong, question.d.correct];
      }
    }
  }

  twoPictureSelected(index) {
    this.twoPictures[0].answered = false;
    this.twoPictures[1].answered = false;
    this.twoPictures[index].answered = true;
  }

  fourPictureSelected(index) {
    this.question.d.pics[0].answered = false;
    this.question.d.pics[1].answered = false;
    this.question.d.pics[2].answered = false;
    this.question.d.pics[3].answered = false;
    this.question.d.pics[index].answered = true;
  }

  oneChecked(index) {
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

  resolveImageUrl(pictureName) {
    return IMAGE_ORIGIN + 'lessons/' + pictureName;
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

  showFailureModal() {
    let modal = this.modalCtrl.create('LessonFailurePage');
    modal.onDidDismiss(data => {
      if (data.action === 'continue') {
        this.initQuestionary();
      } else if (data.action === 'endLesson') {
        this.viewCtrl.dismiss();
      }
    });
    modal.present();
  }

  exit() {
    this.alertCtrl.create({
      title: this.labelExitTitle,
      message: this.labelExitMessage,
      buttons: [
        {
          text: this.labelNo,
          role: 'cancel',
          handler: () => { }
        },
        {
          text: this.labelYes,
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    }).present();
  }

  initTranslations() {
    this.translateService.get(['WANT_TO_EXIT_Q', 'NO', 'YES', 'LOGIN', 'PLEASE_LOGIN',
                               'ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED', 'CANCEL',
                                'PLEASE_LOGIN_TO_CONTINUE']).subscribe(values => {
      this.labelYes = values['YES'];
      this.labelNo = values['NO'];
      this.labelExitTitle = values['WANT_TO_EXIT_Q'];
      this.labelExitMessage = values['ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED'];
      this.labelLogin = values['LOGIN'];
      this.labelLoginTitle = values['PLEASE_LOGIN'];
      this.labelLoginMessage = values['PLEASE_LOGIN_TO_CONTINUE'];
      this.labelLoginEscape = values['CANCEL'];
    });
  }

  labelYes: string;
  labelNo: string;
  labelExitMessage: string;
  labelExitTitle: string;
  labelLogin: string;
  labelLoginEscape: string;
  labelLoginTitle: string;
  labelLoginMessage: string;
}