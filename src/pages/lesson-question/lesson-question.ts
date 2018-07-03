import { Component, OnInit, ViewChild, NgZone, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { IonicPage, Platform, NavParams, AlertController, ViewController,
        Content, ModalController, ToastController } from 'ionic-angular';
import { Market } from '@ionic-native/market';
import { TranslateService } from '@ngx-translate/core';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { findBestMatch } from 'string-similarity';
import { Storage } from '@ionic/storage';
import introJs from 'intro.js/intro.js';
import { StackConfig, DragEvent, SwingStackComponent, SwingCardComponent } from 'angular2-swing';

import { Category, Lesson, Question, Score, TwoWord } from '../../models';
import { IMAGE_ORIGIN } from '../../app/app.constants';
import { Principal } from '../../providers/auth/principal.service';
import { LoginService } from '../../providers/login/login.service';
import { Settings, Memory } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-lesson-question',
  templateUrl: 'lesson-question.html'
})
export class LessonQuestionPage implements OnInit {
  @ViewChild(Content) content: Content;
  @ViewChild('myswing1') swingStack: SwingStackComponent;
  @ViewChildren('mycards1') swingCards: QueryList<SwingCardComponent>;
  @ViewChild('writingAnswerTextarea') writingAnswerTextarea: ElementRef;
  lesson: Lesson; category: Category; question: Question; questions: Question[];
  options: any[]; chosens: any[]; choices: any[];
  twoPicturesNominated: string[]; pictureCorrectIndex: number;
  noTotal: number; noWrong: number;
  writingAnswer: string = ''; speakingAnswer: string; wordAnswer: boolean; rightAnswerString: string;
  wasCorrect: boolean; wasWrong: boolean; wasAlmostCorrect: boolean;
  isChecking: boolean; autoPlayVoice: boolean; autoContinue: boolean; skipSpeaking: boolean;
  microphonePressed: boolean; hasAudioRecordingPermission: boolean;
  speakingAnswerDiff: any; writingAnswerDiff: any; hasFirstRoleInConversation: boolean;
  cards: TwoWord[]; words: TwoWord[];
  stackConfig: StackConfig; leftBackgroundColor: string; rightBackgroundColor: string;
  dir: string = 'ltr'; questionCounter: number; lookupWords: any; description: string; typeHere: string;
  private unregisterBackButtonAction: any; private exitAlertInstance: any;
  private questionStartIndex: number = 0;

  constructor(private platform: Platform, navParams: NavParams, private alertCtrl: AlertController,
              private translateService: TranslateService, private viewCtrl: ViewController,
              private principal: Principal, private loginService: LoginService,
              private modalCtrl: ModalController, private ngZone: NgZone, private market: Market,
              private textToSpeech: TextToSpeech, private speechRecognition: SpeechRecognition,
              private settings: Settings, private storage: Storage, private toastCtrl: ToastController,
              private memory: Memory) {
    this.dir = platform.dir();
    this.lesson = navParams.get('lesson');
    this.category = navParams.get('category');
    this.questions = navParams.get('questions');
    this.lookupWords = navParams.get('words');
    // this.lesson.determinePictureCorrectIndexies(this.questions, this.lookupWords);
    this.initTranslations();
    this.initSettings();
    this.initSwingStackConfig();
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

  ngAfterViewInit() {
    if (this.swingStack) {
      this.swingStack.throwin.subscribe((event: DragEvent) => {
        event.target.style.background = '#ffffff';
      });
    }
  }

  initQuestionary() {
    this.noWrong = 0;
    this.questionCounter = this.questionStartIndex;
    this.goToNextQuestion();
  }

  check() {
    this.isChecking = true;
    if (this.question.isAnswerRight(this)) {
      this.wasCorrect = true;
      if (this.autoContinue && !this.wasAlmostCorrect) {
        setTimeout(() => {
          if (this.isChecking) {
            this.continue();
          }
        }, 2000);
      }
    } else {
      this.wasWrong = true;
      this.noWrong++;
    }
    this.question.resolveRightAnswerString(this, true);
    setTimeout(() => {
      this.content.scrollToBottom(1000);
    }, 300);
  }

  continue() {
    this.wasWrong = false;
    this.wasCorrect = false;
    this.wasAlmostCorrect = false;
    this.speakingAnswerDiff = null;
    this.writingAnswerDiff = null;
    this.speakingAnswer = null;
    this.writingAnswer = '';
    this.goToNextQuestion();
  }

  get isInContinueState(): boolean {
    return this.wasWrong || this.wasCorrect || this.wasAlmostCorrect;
  }

  goToNextQuestion() {
    this.ngZone.run(() => {
    // if (this.isType('FourPicture') && this.fourPictures.length === 3) {
    //   this.pictureCorrectIndex = this.determinePictureCorrectIndex();
    //   this.fourPictures.splice(1, 1);
    //   this.markPictureAsUnAnswered(4);
    //   this.isChecking = false;
    //   if (this.autoPlayVoice) {
    //     this.speak();
    //   }
    // }
    if (this.isType('Conversation')) {
      this.noTotal = this.question.d.options.length;
      this.checkIfIsEnd();
      this.checkIfIsEndFailure();
      this.questionCounter++;
      this.speak().then(() => {
        this.checkIfIsEnd();
        this.questionCounter++;
        this.isChecking = false;
      }).catch(() => {
        this.checkIfIsEnd();
        this.questionCounter++;
        this.isChecking = false;
      });
      this.content.scrollToBottom();
    }
    else if (this.isType('Words')) {
      this.noTotal = this.question.d.options.length * 2;
      this.checkIfIsEnd();
      this.checkIfIsEndFailure();
      this.questionCounter++;
      this.isChecking = false;
      this.cards = [this.words[this.questionCounter-1]];
      if (this.autoPlayVoice) {
        this.speak();
      }
    }
    else {
      this.noTotal = this.questions.length;
      this.checkIfIsEnd();
      this.checkIfIsEndFailure();
      this.questionCounter++;
      this.isChecking = false;
      if (this.questions[this.questionCounter-1]) {
        this.setQuestion(this.questions[this.questionCounter-1]);
      }
    }
    });
  }

  checkIfIsEnd() {
    if (this.questionCounter >= this.noTotal) {
      this.uploadScore();
      return;
    }
  }

  checkIfIsEndFailure() {
    if (this.noWrong === 5) {
      this.showFailureModal();
      return;
    }
  }

  setQuestion(q: Question) {
  this.ngZone.run(() => {
    this.question = new Question(q.uuid, q.type, q.indexOrder, q.dynamicPart, null, this.lookupWords);
    if (this.isType('MultiSelect')) {
      this.options = this.question.multiSelectOptions();
      this.chosens = [];
      this.description = this.question.d.listen ? 'TRANSLATE_WHAT_YOU_HEAR' : 'TRANSLATE_THIS_SENTENCE';
    } else if (this.isType('OneCheck')) {
      this.choices = this.question.oneCheckChoices();
      this.question.toneCheckAnswer;  // for initalize answer into variable and also speak function works as expected.
      this.description = 'CHOOSE_CORRECT_TRANSLATION';
    } else if (this.isType('FourPicture')) {
      this.pictureCorrectIndex = this.determinePictureCorrectIndex();
      this.description = 'CHOOSE_CORRECT_PICTURE';
    } else if (this.isType('TwoPicture')) {
      this.pictureCorrectIndex  = this.determinePictureCorrectIndex();
      this.description = 'CHOOSE_CORRECT_PICTURE';
    } else if (this.isType('Writing')) {
      this.description = 'TRANSLATE_THIS_SENTENCE';
      this.typeHere = this.question.isN() ? 'TYPE_HERE_' + this.lesson.motherLangKey : 'TYPE_HERE_' + this.lesson.targetLangKey;
      setTimeout(() => {
        this.writingAnswerTextarea.nativeElement.focus();
      }, 300);
    } else if (this.isType('Speaking')) {
      this.description = 'CLICK_MICROPHONE_AND_SAY';
      if (this.skipSpeaking) {
        this.goToNextQuestion();
      }
      else {
        if (!this.hasAudioRecordingPermission) {
          this.checkHasAudioRecordingPermission();
        }
      }
    } else if (this.isType('Conversation')) {
      this.showConversationRoleConfirmation();
      this.description = 'CLICK_MICROPHONE_AND_SAY';
    } else if (this.isType('Words')) {
      this.words = this.setupTwoWords();
      this.cards = [this.words[this.questionCounter-1]];
      this.description = 'CHOOSE_CORRECT_TRANSLATION';
    }
    if (this.autoPlayVoice) {
      if (this.isType('Speaking') && this.skipSpeaking || this.isType('Conversation')) {
        // don't speak.
      }
      else {
        this.speak();
      }
    }
    setTimeout(() => {
      this.content.scrollToBottom(1000);
    }, 300);
  });
  }

  isAnswered() {
    return this.question ? this.question.isAnswered(this) : false;
  }

  speak(text?: string) {
    if (!text) {
      text = this.questionFaceForSpeak;
    }
    if (this.isType('Writing')) {
      setTimeout(() => {
        this.writingAnswerTextarea.nativeElement.focus();
      }, 300);
    }
    return this.textToSpeech.speak({
      text: text,
      locale: this.lesson.targetLocale(),
      rate: this.settings.allSettings.voiceSpeedRate / 100
    }).then().catch((error) => {
      console.log('TTS#', error);
      const toast = this.toastCtrl.create({
        message: this.labelPleaseUpdateThisOtherAppFromMarket,
        duration: 10000,
        showCloseButton: true,
        closeButtonText: this.labelMarket
      });
      toast.onDidDismiss((data, role) => {
        if (role === 'close') {
          this.market.open('com.google.android.tts');
        }
      })
      toast.present();
    });
  }

  determinePictureCorrectIndex(): number {
    const options = this.question.d.options;
    for (let i = 0; i < options.length; i++)  {
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
    return Math.floor(Math.random() * (options.length - 1 + 1)) + 0;
  }

  twoPictureSelected(index) {
    if (!this.isChecking) {
      this.markPictureAsUnAnswered(2);
      this.question.d.options[index].answered = true;
    }
  }

  fourPictureSelected(index) {
    if (!this.isChecking) {
      this.markPictureAsUnAnswered(4);
      this.question.d.options[index].answered = true;
    }
  }

  markPictureAsUnAnswered(count) {
    for (let i = 0; i < count; i++) {
      this.question.d.options[i].answered = false;
    }
  }

  oneChecked(index) {
    if (this.isInContinueState) return;
    for (let i = 0; i < this.choices.length; i++) {
      delete this.choices[i].picked;
    }
    this.choices[index].picked = index + 1;
  }

  moveToChosen(item) {
    // this.speak(item.text); // TODO
    if (this.isInContinueState) return;
    this.chosens.push(JSON.parse(JSON.stringify(item)));
    item.class = 'option-selected';
  }

  moveBackToOptions(item) {
    if (this.isInContinueState) return;
    this.chosens.splice(this.chosens.indexOf(item), 1);
    this.options.forEach((option) => {
      if (option.text === item.text) {
        option.class = 'option-deselected';
      }
    });
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
      this.speechRecognition.startListening({ language: this.lesson.targetLocale() }).subscribe((matches: any) => {
        let findBest;
        if (this.isType('Speaking')) {
          findBest = findBestMatch(this.question.speakingAnswer(), matches);
        } else if (this.isType('Conversation')) {
          findBest = findBestMatch(this.question.conversationAnswer(this.questionCounter-1), matches);
        }
        this.speakingAnswer = findBest.bestMatch.target;
        this.check();
        this.microphoneUp(event);
      },
      (error) => {
        console.log('Oops: ', error);
        this.microphoneUp(event);
        const toast = this.toastCtrl.create({
          message: this.labelPleaseUpdateThisOtherAppFromMarket,
          duration: 4000,
          position: 'middle',
          showCloseButton: true,
          closeButtonText: this.labelMarket
        });
        toast.onDidDismiss((data, role) => {
          if (role === 'close') {
            this.market.open('com.google.android.googlequicksearchbox');
          }
        })
        toast.present();
      });
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

  onItemSwing(element, x, y, r) {
    // let color = '';
    const abs = Math.abs(x);
    const min = Math.trunc(Math.min(16*16 - abs, 16*16));
    const hexCode = this.decimalToHex(min, 2);

    if (x < 0) {
      if (this.platform.isRTL) {
        this.rightBackgroundColor = '#' + hexCode + hexCode + 'FF';
        this.leftBackgroundColor = '#f4f4f4';
      } else {
        this.leftBackgroundColor = '#' + hexCode + hexCode + 'FF';
        this.rightBackgroundColor = '#f4f4f4';
      }
    } else {
      if (this.platform.isRTL) {
        this.leftBackgroundColor = '#' + hexCode + hexCode + 'FF';
        this.rightBackgroundColor = '#f4f4f4'
      } else {
        this.rightBackgroundColor = '#' + hexCode + hexCode + 'FF';
        this.leftBackgroundColor = '#f4f4f4';
      }
    }

    // element.style.background = color;
    element.style['transform'] = `translate3d(0, 0, 0) translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  voteUp(right: boolean) {
    if (!this.isChecking) {
      console.log('cards ', JSON.stringify(this.cards), ' given answer: ', right);
      this.cards.pop();
      this.wordAnswer = this.platform.isRTL ? !right : right;
      this.check();
      if (this.wordAnswer) {
        console.log('You went to the right actually!');
      } else {
        console.log('You went to the left actually!');
      }
    } else {
      console.log('WARNING voteUp event happend in isChecking state!');
    }
  }

  setupTwoWords(): TwoWord[] {
    return TwoWord.toTwoWordList(this.question);
  }

  get questionFaceForSpeak(): string {
    return this.question.faceForSpeak(this);
  }

  get questionFace(): string {
    return this.question.face(this);
  }

  get speakingAnswerDiffString(): string {
    return this.speakingAnswerDiff.map(x => x.value).join(' ');
  }

  get writingAnswerDiffString(): string {
    return this.writingAnswerDiff.map(x => x.value).join(' ');
  }

  uploadScore() {
    let score: Score = new Score(this.lesson.type, this.lesson.learnDir, 10 - this.noWrong,
                                 5 - this.noWrong, this.lesson.uuid, this.category ? this.category.uuid: null, this.settings.difficultyLevel);
    this.storage.set('LAST_SCORE', JSON.stringify(score));
    if (!this.principal.isAuthenticated()) {
      this.alertCtrl.create({
        title: this.labelLoginTitle,
        message: this.labelLoginMessage,
        buttons: [
          {
            text: this.labelLoginEscape,
            role: 'cancel',
            handler: () => { this.dismiss(true); }
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
      modal.onDidDismiss((data) => { });
      modal.present();
      this.dismiss(true);
    }
  }

  skipSpeakingQuestions() {
    this.skipSpeaking = true;
    this.goToNextQuestion();
  }

  autoPlayVoiceReverse() {
    this.autoPlayVoice = !this.autoPlayVoice;
  }

  get isRTL(): boolean {
    return this.platform.isRTL;
  }

  addCharToWritingAnswer(char) {
    this.writingAnswer += char;
    this.writingAnswerTextarea.nativeElement.focus();
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
    return this.question.shuffle(array);
  }

  decimalToHex(d, padding) {
    let hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;
    while (hex.length < padding) {
      hex = "0" + hex;
    }
    return hex;
  }

  showFailureModal() {
    let modal = this.modalCtrl.create('LessonFailurePage');
    modal.onDidDismiss(data => {
      if (data.action === 'continue') {
        this.initQuestionary();
      } else if (data.action === 'endLesson') {
        this.dismiss(false);
      }
    });
    modal.present();
  }

  exit() {
    this.exitAlertInstance = this.alertCtrl.create({
      title: this.labelExitTitle,
      message: this.labelExitMessage,
      buttons: [
        { text: this.labelNo, role: 'cancel', handler: () => { } },
        { text: this.labelYes, handler: () => { this.dismiss(false); } } ]
    });
    this.exitAlertInstance.present();
  }

  dismiss(withSuccess) {
    this.memory.setLessonDoneSuccessfully(withSuccess);
    this.viewCtrl.dismiss();
  }

  initSettings() {
    this.autoPlayVoice = this.settings.allSettings.autoPlayVoice;
    this.autoContinue = this.settings.allSettings.autoContinue;
  }

  initSwingStackConfig() {
    this.stackConfig = {
      throwOutConfidence: (offsetX, offsetY, element) => {
        return Math.min(Math.abs(offsetX) / (element.offsetWidth/2), 1);
      },
      transform: (element, x, y, r) => {
        this.onItemSwing(element, x, y, r);
      },
      throwOutDistance: (d) => {
        return 400;
      }
    };
  }

  initalizeBackButtonCustomHandler() {
    console.log('custom init back handler called acutally!');
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

  showConversationRoleConfirmation() {
    this.alertCtrl.create({
      title: this.labelWhichRole,
      message: this.labelWhichRoleYouWantToHaveInTheConversation,
      buttons: [
        {
          text: this.labelFirstRole,
          role: 'cancel',
          handler: () => {
            this.hasFirstRoleInConversation = true;
          }
        },
        {
          text: this.labelSecondRole,
          handler: () => {
            this.hasFirstRoleInConversation = false;
            this.speak().then(() => {
              this.questionCounter++;
            }).catch(() => {
              this.questionCounter++;
            });
          }
        }
      ]
    }).present();
  }

  showHelp() {
    let introInstance = introJs.introJs();
    let introSteps = [];
    if (this.isType('MultiSelect')) {
      introSteps = [
        { element: '#optionsContainer', intro: this.labelFirstChooseAnOption, position: 'auto' },
        { element: '#answer-background', intro: this.labelReviewYourAnswerHere, position: 'auto' },
        { element: '#checkButton', intro: this.labelClickCheckButton, position: 'auto'} ];
    }
    else if (this.isType('TwoPicture')) {
      introSteps = [
        { element: '#twoPicture-' + this.pictureCorrectIndex, intro: this.labelSelectACorrectPicture, position: 'auto' } ];
    }
    else if (this.isType('FourPicture')) {
      introSteps = [
        { element: '#fourPicture-' + this.pictureCorrectIndex, intro: this.labelSelectACorrectPicture, position: 'auto' } ];
    }
    else if (this.isType('MutliCheck')) {
      introSteps = [
        { element: '#checkbox-0', intro: this.labelSelectCorrectAnswers, position: 'auto' },
        { element: '#checkButton', intro: this.labelClickCheckButton, position: 'auto' } ];
    }
    else if (this.isType('OneCheck')) {
      introSteps = [
        { element: '#radio-0', intro: this.labelSelectACorrectAnswer, position: 'auto' },
        { element: '#checkButton', intro: this.labelClickCheckButton, position: 'auto' } ];
    }
    else if (this.isType('Writing')) {
      introSteps = [
        { element: '.answer-background', intro: this.labelTypeCorrectAnswerHere, position: 'auto' } ];
    }
    else if (this.isType('Speaking')) {
      introSteps = [
        { element: '#speakingButton', intro: this.labelHoldMicrophoneButtonAndSpeak, position: 'auto' } ];
    }

    introInstance.setOptions({
      steps: introSteps,
      showStepNumbers: false,
      exitOnOverlayClick: true,
      exitOnEsc:true,
      nextLabel: this.labelNext,
      prevLabel: this.labelPrev,
      skipLabel: this.labelOk,
      doneLabel: this.labelOk
    });
    introInstance.start();
  }

  initTranslations() {
    this.translateService.get(['WANT_TO_EXIT_Q', 'NO', 'YES', 'LOGIN', 'PLEASE_LOGIN',
                               'ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED', 'CANCEL_BUTTON',
                               'PLEASE_LOGIN_TO_CONTINUE',
                               'OK', 'NEXT', 'PREV', 'FIRST_CHOOSE_AN_OPTION',
                               'SELECT_A_CORRECT_PICTURE', 'SELECT_A_CORRECT_ANSWER',
                               'SELECT_CORRECT_ANSWERS', 'TYPE_CORRECT_ANSWER_HERE',
                               'REVIEW_YOUR_ANSWER_HERE', 'HOLD_MICROPHONE_BUTTON_AND_SPEAK',
                               'CLICK_CHECK_BUTTON',
                               'WHICH_ROLE', 'WHICH_ROLE_DO_YOU_PREFER_TO_HAVE_IN_THIS_CONVERSATION',
                               'FIRST_ROLE', 'SECOND_ROLE',
                               'MARKET', 'PLEASE_UPDATE_THIS_OTHER_APP_FROM_MARKET']).subscribe(values => {
      this.labelYes = values.YES;
      this.labelNo = values.NO;
      this.labelExitTitle = values.WANT_TO_EXIT_Q;
      this.labelExitMessage = values.ARE_YOU_SURE_Q_YOUR_PROGRESS_WILL_NOT_BE_SAVED;
      this.labelLogin = values.LOGIN;
      this.labelLoginTitle = values.PLEASE_LOGIN;
      this.labelLoginMessage = values.PLEASE_LOGIN_TO_CONTINUE;
      this.labelLoginEscape = values.CANCEL_BUTTON;

      this.labelOk = values.OK;
      this.labelNext = values.NEXT;
      this.labelPrev = values.PREV;
      this.labelFirstChooseAnOption = values.FIRST_CHOOSE_AN_OPTION;
      this.labelSelectACorrectPicture = values.SELECT_A_CORRECT_PICTURE;
      this.labelSelectACorrectAnswer = values.SELECT_A_CORRECT_ANSWER;
      this.labelSelectCorrectAnswers = values.SELECT_CORRECT_ANSWERS;
      this.labelTypeCorrectAnswerHere = values.TYPE_CORRECT_ANSWER_HERE;
      this.labelReviewYourAnswerHere = values.REVIEW_YOUR_ANSWER_HERE;
      this.labelClickCheckButton = values.CLICK_CHECK_BUTTON;
      this.labelHoldMicrophoneButtonAndSpeak = values.HOLD_MICROPHONE_BUTTON_AND_SPEAK;

      this.labelWhichRole = values.WHICH_ROLE;
      this.labelFirstRole = values.FIRST_ROLE;
      this.labelSecondRole = values.SECOND_ROLE;
      this.labelWhichRoleYouWantToHaveInTheConversation = values.WHICH_ROLE_DO_YOU_PREFER_TO_HAVE_IN_THIS_CONVERSATION;

      this.labelPleaseUpdateThisOtherAppFromMarket = values.PLEASE_UPDATE_THIS_OTHER_APP_FROM_MARKET;
      this.labelMarket = values.MARKET;
    });
  }

  labelYes: string; labelNo: string; labelOk: string; labelNext: string; labelPrev: string;
  labelExitTitle: string; labelExitMessage: string;
  labelLogin: string; labelLoginEscape: string; labelLoginTitle: string; labelLoginMessage: string;
  labelFirstChooseAnOption: string; labelSelectACorrectPicture: string; labelSelectACorrectAnswer: string;
  labelSelectCorrectAnswers: string; labelTypeCorrectAnswerHere: string; labelReviewYourAnswerHere: string;
  labelClickCheckButton: string; labelHoldMicrophoneButtonAndSpeak: string;
  labelWhichRole: string; labelWhichRoleYouWantToHaveInTheConversation: string;
  labelFirstRole: string; labelSecondRole: string;
  labelMarket: string; labelPleaseUpdateThisOtherAppFromMarket: string;
}