import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { IonicPage, Platform, NavParams, AlertController, ViewController,
        Content, ModalController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { compareTwoStrings, findBestMatch } from 'string-similarity';
import { diffWords } from 'diff';
import { Storage } from '@ionic/storage';

import { Category, Lesson, Question, Score, ScoreType } from '../../models';
import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Principal } from '../../providers/auth/principal.service';
import { LoginService } from '../../providers/login/login.service';
import { Settings } from '../../providers/settings/settings';

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
  questionCounter: number;
  options: any[];
  chosens: any[];
  choices: any[];
  twoPicturesNominated: string[];
  fourPictures: number[];
  fourPictureCorrectIndex: number;
  twoPictureCorrectIndex: number;
  isChecking: boolean;
  noCorrect: number;
  noWrong: number;
  writingAnswer: string;
  wasCorrect: boolean;
  wasWrong: boolean;
  wasAlmostCorrect: boolean;
  rightAnswerString: string;
  autoPlayVoice: boolean;
  autoContinue: boolean;
  microphonePressed: boolean;
  hasAudioRecordingPermission: boolean;
  speakingAnswer: string;
  speakingAnswerDiff: any;
  skipSpeaking: boolean;
  textCompareAcceptablePercentage: number = 0.7;
  private unregisterBackButtonAction: any;
  private exitAlertInstance: any;

  constructor(private platform: Platform, navParams: NavParams, private alertCtrl: AlertController,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private principal: Principal, private loginService: LoginService,
              private modalCtrl: ModalController, private ngZone: NgZone,
              private settings: Settings,
              private textToSpeech: TextToSpeech, private speechRecognition: SpeechRecognition,
              private storage: Storage) {
    this.dir = platform.dir();
    const l: Lesson = navParams.get('lesson');
    this.lesson = new Lesson(l.uuid, l.title, l.translDir, l.indexOrder);
    this.category = navParams.get('category');
    this.questions = navParams.get('questions');
    this.initTranslations();
    this.initSettings();
  }

  ngOnInit() {
    this.initQuestionary();
  }

  ionViewDidLoad() {
    this.initalizeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
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
      if (this.autoContinue && !this.wasAlmostCorrect) {
        setTimeout(() => {
          if (this.isChecking) {
            this.wasCorrect = false;
            this.wasAlmostCorrect = false;
            this.goToNextQuestion();
          }
        }, 2000);
      }
    } else {
      this.wasWrong = true;
      this.noWrong++;
    }
    this.resolveRightAnswerString(true);
  }

  continue() {
    this.wasWrong = false;
    this.wasCorrect = false;
    this.wasAlmostCorrect = false;
    this.goToNextQuestion();
  }

  goToNextQuestion() {
    if (this.isType('FourPicture') && this.fourPictures.length === 3) {
      this.fourPictureCorrectIndex = this.fourPictures[1];
      this.fourPictures.splice(1, 1);
      this.question.d.pics[0].answered = false;
      this.question.d.pics[1].answered = false;
      this.question.d.pics[2].answered = false;
      this.question.d.pics[3].answered = false;
      this.isChecking = false;
      if (this.autoPlayVoice) {
        this.speak();
      }
    }
    else {
      if (this.questionCounter >= this.questions.length) {
        this.questionCounter++;
        this.uploadScore();
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
  }

  uploadScore() {
    let score: Score = new Score(ScoreType[ScoreType.LESSON.toString()], this.lesson.translDir, 10 - this.noWrong,
                                 5 - this.noWrong, this.lesson.uuid, this.category.uuid);
    this.storage.set('LAST_SCORE', JSON.stringify(score));
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
              }, (err) => {
              });
            }
          }
        ]
      }).present();
    } else {
      let modal = this.modalCtrl.create('LessonScorePage');
      modal.onDidDismiss(data => {
        // if (data.action === 'continue') {
        // }
        this.viewCtrl.dismiss();
      });
      modal.present();
    }
  }

  setQuestion(q: Question) {
    this.ngZone.run(() => {
    let d, m, t;
    try { d = JSON.parse(q.dynamicPart); } catch(error) { };
    try { m = JSON.parse(q.motherPart); } catch(error) { };
    try { t = JSON.parse(q.targetPart); } catch(error) { };
    this.question = new Question(q.uuid, q.type, q.description, q.indexOrder, q.dynamicPart, q.motherPart, q.targetPart, d, m, t);
    if (this.isType('MultiSelect')) {
      this.options = this.question.multiSelectOptions();
      this.chosens = [];
    } else if (this.isType('OneCheck')) {
      this.choices = this.question.oneCheckChoices();
    } else if (this.isType('FourPicture')) {
      this.fourPictures = this.shuffleArray([0, 1, 2, 3]);
      this.fourPictureCorrectIndex = this.fourPictures[2];
      this.fourPictures.splice(2, 1);
      this.content.scrollToBottom();
    } else if (this.isType('TwoPicture')) {
      this.twoPictureCorrectIndex  = this.determineTwoPictureCorrectIndex();
      this.content.scrollToBottom();
    } else if (this.isType('Speaking')) {
      if (this.skipSpeaking) {
        this.goToNextQuestion();
      }
      else {
        if (!this.hasAudioRecordingPermission) {
          this.checkHasAudioRecordingPermission();
        }
      }
    }
    if (this.autoPlayVoice) {
      if (this.isType('Speaking') && this.skipSpeaking) {
        // don't speak.
      }
      else {
        this.speak();
      }
    }
    console.log('MotherLangRTL ', this.lesson.isMotherLangRTL(), 'isNormal ' ,this.question.isN());
    });
  }

  isAnswerRight() {
    if (this.isType('MultiSelect')) {
      const answers: any[] = this.question.multiSelectAnswers();
      let expected = answers.map((x) => x.text).join(' ');
      let actual = this.chosens.map((x) => x.text).join(' ');
      const correctPercentage = compareTwoStrings(expected, actual);
      console.log('Multi answer was ', correctPercentage, ' right.', expected, actual);
      if (correctPercentage > this.textCompareAcceptablePercentage) {
        this.wasAlmostCorrect = correctPercentage === 1 ? false : true;
        return true;
      }
    }
    else if (this.isType('TwoPicture')) {
      return this.question.d.pics[this.twoPictureCorrectIndex].answered;
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
    }
    else if (this.isType('Writing')) {
      const actual = this.writingAnswer.replace(/\s+/g, ' ').trim();
      const expected = this.question.writingAnswer();
      const correctPercentage = compareTwoStrings(expected, actual);
      console.log('Writing answer was ', correctPercentage, ' right.', expected, actual);
      if (correctPercentage > this.textCompareAcceptablePercentage) {
        this.wasAlmostCorrect = correctPercentage === 1 ? false: true;
        return true;
      }
    }
    else if (this.isType('Speaking')) {
      if (this.speakingAnswer) {
        const correctPercentage = compareTwoStrings(this.question.speakingAnswer(), this.speakingAnswer);
        console.log('Speaking answer was ', correctPercentage, ' right.', this.question.speakingAnswer(), this.speakingAnswer);
        if (correctPercentage > this.textCompareAcceptablePercentage) {
          this.wasAlmostCorrect = correctPercentage === 1 ? false: true;
          return true;
        }
      }
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
      else if (this.isType('TwoPicture') || this.isType('FourPicture')) {
        for (let i = 0; i < this.question.d.pics.length; i++) {
          if (this.question.d.pics[i].answered) {
            return true;
          }
        }
      }
    }
    return false;
  }

  resolveRightAnswerString(autoCorrect?:boolean): string {
    let result = '';
    if (this.isType('TwoPicture')) {
      result = this.question.pictureLabel(this.twoPictureCorrectIndex);
    }
    else if (this.isType('FourPicture')) {
      result = this.question.pictureLabel(this.fourPictureCorrectIndex);
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
      result = this.question.writingAnswer();
    }
    else if (this.isType('Speaking')) {
      this.speakingAnswerDiff = diffWords(this.question.speakingAnswer(), this.speakingAnswer, { ignoreCase: true });
      result = this.question.speakingAnswer();
    }
    else if (this.isType('MultiSelect')) {
      const answers = this.question.multiSelectAnswers();
      result = answers.map((e) => e.text).join(' ');
      if (autoCorrect) {
        for (let i = 0; i < this.chosens.length; i++) {
          let wasIn = false;
          for (let j = 0; j < answers.length; j++) {
            if (this.chosens[i].text === answers[j].text) {
              wasIn = true;
            }
          }
          if (wasIn) {
            this.chosens[i].class = 'part-added';
          } else {
            this.chosens[i].class = 'part-removed';
          }
        }
        for (let i = 0; i < this.options.length; i++) {
          for (let j = 0; j < answers.length; j++) {
            if (this.options[i].text === answers[j].text) {
              this.options[i].class = 'part-added';
            }
          }
        }
      }
    }
    this.rightAnswerString = result;
    return result;
  }

  speak(text?: string) {
    if (!text) {
      text = this.questionFaceForSpeak;
    }
    this.textToSpeech.speak({
      text: text,
      locale: this.lesson.targetLocale(),
      rate: this.settings.allSettings.voiceSpeedRate / 100
    }).then().catch((error) => console.log('TTS#', error));
  }

  determineTwoPictureCorrectIndex(): number {
    for (let i = 0; i < this.question.d.pics.length; i++)  {
      if (this.twoPicturesNominated) {
        if (this.twoPicturesNominated.indexOf(this.question.pictureLabel(i)) <= -1) {
          this.twoPicturesNominated.push(this.question.pictureLabel(i));
          return i;
        }
      }
      else {
        this.twoPicturesNominated = [this.question.pictureLabel(i)];
        return i;
      }
    }
  }

  twoPictureSelected(index) {
    if (!this.isChecking) {
      this.question.d.pics[0].answered = false;
      this.question.d.pics[1].answered = false;
      this.question.d.pics[index].answered = true;
      this.check();
    }
  }

  fourPictureSelected(index) {
    if (!this.isChecking) {
      this.question.d.pics[0].answered = false;
      this.question.d.pics[1].answered = false;
      this.question.d.pics[2].answered = false;
      this.question.d.pics[3].answered = false;
      this.question.d.pics[index].answered = true;
      this.check();
    }
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
    if (this.question) {
      return this.question.isType(type);
    }
    return false;
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

  microphoneDown(event) {
    this.microphonePressed = true;
    if (this.hasAudioRecordingPermission) {
      this.speechRecognition.startListening()
        .subscribe(
          (matches: Array<string>) => {
            let findBest = findBestMatch(this.question.d.question, matches);
            this.speakingAnswer = findBest.bestMatch.target;
            this.check();
            this.microphoneUp(event);
          },
          (error) => {
            console.log('Oops: ', error);
            this.microphoneUp(event);
          }
        );
    } else {
      this.checkHasAudioRecordingPermission();
    }
  }

  microphoneUp(event) {
    this.microphonePressed = false;
    if (this.platform.is('ios')) {
      this.speechRecognition.stopListening();
    }
  }


  get questionFaceForSpeak(): string {
    if (this.question && this.question.d) {
      if (this.isType('TwoPicture')) {
        return this.question.pictureLabel(this.twoPictureCorrectIndex);
      }
      else if (this.isType('FourPicture')) {
        return this.question.pictureLabel(this.fourPictureCorrectIndex);
      }
      else {
        return this.question.t.question;
      }
    }
  }

  get questionFace(): string {
    if (this.question && this.question.d) {
      if (this.isType('TwoPicture')) {
        return this.question.pictureQuestion(this.twoPictureCorrectIndex);
      }
      else if (this.isType('FourPicture')) {
        return this.question.pictureQuestion(this.fourPictureCorrectIndex);
      }
      else {
        return this.question.d.reverse ? this.question.m.question : this.question.t.question;
      }
    }
  }

  skipSpeakingQuestions() {
    this.skipSpeaking = true;
    this.goToNextQuestion();
  }

  checkHasAudioRecordingPermission() {
    this.speechRecognition.hasPermission().then((hasPermission: boolean) => {
      if (!hasPermission) {
        this.speechRecognition.requestPermission().then(
          () => this.hasAudioRecordingPermission = true,
          () => this.hasAudioRecordingPermission = false
        );
      } else {
        this.hasAudioRecordingPermission = true;
      }
    });
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
    this.exitAlertInstance = this.alertCtrl.create({
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
    });
    this.exitAlertInstance.present();
  }

  initSettings() {
    this.autoPlayVoice = this.settings.allSettings.autoPlayVoice;
    this.autoContinue = this.settings.allSettings.autoContinue;
  }

  initalizeBackButtonCustomHandler() {
    let that = this;
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function(event) {
      if (that.exitAlertInstance) {
        that.exitAlertInstance.dismiss();
        that.exitAlertInstance = null;
      } else {
        that.exit();
      }
    }, 101);  // Priorty 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file.
  }

  initTranslations() {
    this.translateService.get(['WANT_TO_EXIT_Q', 'NO', 'YES', 'LOGIN', 'PLEASE_LOGIN',
                               'ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED', 'CANCEL_BUTTON',
                                'PLEASE_LOGIN_TO_CONTINUE']).subscribe(values => {
      this.labelYes = values['YES'];
      this.labelNo = values['NO'];
      this.labelExitTitle = values['WANT_TO_EXIT_Q'];
      this.labelExitMessage = values['ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED'];
      this.labelLogin = values['LOGIN'];
      this.labelLoginTitle = values['PLEASE_LOGIN'];
      this.labelLoginMessage = values['PLEASE_LOGIN_TO_CONTINUE'];
      this.labelLoginEscape = values['CANCEL_BUTTON'];
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