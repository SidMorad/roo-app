import { compareTwoStrings } from 'string-similarity';
import { diffWords } from 'diff';

import { QuestionType } from './question-type';
import { IMAGE_ORIGIN } from '../app/app.constants';
import { QuestionUtil } from '../providers';

const npl = require('compromise');

export class Question {
  constructor(
    public uuid?: string,
    public type?: QuestionType,
    public indexOrder?: number,
    public dynamicPart?: string,
    public d?: any, // dynamicPart object
    public lookupWords?: any
  ) {
    try { this.d = JSON.parse(this.dynamicPart); }
    catch(error) { console.warn('Parsing dynamicPart failed!'); };
    switch(this.type.toString()) {
      case 'MultiSelect':
        this.answer;
        this.initOptions(false);
        this.multiSelectOptions();
        break;
      case 'OneCheck':
        this.d.options = this.shuffle(this.d.options);
        this.initOptions(false);
        this.oneCheckChoices();
        this.toneCheckAnswer;  // for initalize answer into variable and also speak function works as expected.
        this.moneCheckAnswer;  // for initalize answer into variable.
        break;
      case 'Words':
        this.initOptions(true);
        break;
      case 'FourPicture':
      case 'TwoPicture':
        this.d.options = this.shuffle(this.d.options);
        this.initOptions(false);
        break;
      case 'Writing':
      case 'Speaking':
      case 'Conversation':
        this.initOptions(false);
        break;
    }
  }

  public readonly textCompareAcceptablePercentage: number = 0.8;
  public readonly multiSelectCompareAcceptablePercentage: number = 0.9;
  public readonly speakCompareAcceptablePercentage: number = 0.7;
  public readonly writingCompareAcceptablePercentage: number = 0.7;
  public targetOptions: any[];             public motherOptions: any[];
  private targetMultiSelectOptions: any[];  private motherMultiSelectOptions: any[];
  private targetOneCheckAnswer: any;         private motherOneCheckAnswer: any;
  private spellSelectOptionsProperty: any[]; private oneSelectOptionsProperty: any[];
  private oneSelectBeforeAnswer: string;     private oneSelectAfterAnswer: string;

  initOptions(removeDot: boolean) {
    this.toptions(removeDot);
    this.moptions(removeDot);
  }

  isAnswerRight(viewComp) {
    if (this.isType('MultiSelect')) {
      const answers: any[] = this.multiSelectAnswers();
      let expected = answers.map((x) => x.text).join(' ');
      let actual = viewComp.chosens.map((x) => x.text).join(' ');
      const correctPercentage = compareTwoStrings(expected, actual);
      console.log('Multi answer was ', correctPercentage, ' right.', expected, actual);
      if (correctPercentage > this.multiSelectCompareAcceptablePercentage) {
        viewComp.wasAlmostCorrect = correctPercentage === 1 ? false : true;
        if (answers.length !== viewComp.chosens.length) {
          viewComp.wasAlmostCorrect = true;
        } else {
          for (let i = 0; i < answers.length; i++) {
            if (answers[i].text !== viewComp.chosens[i].text) {
              viewComp.wasAlmostCorrect = true;
            }
          }
        }
        return true;
      }
    }
    else if (this.isType('OneSelect')) {
      const expected = this.lookupWordTarget(this.d.question);
      const actual = this.oneSelectBeforeAnswer + viewComp.chosen.text + this.oneSelectAfterAnswer;
      console.log('Expected: ', expected, ' Actual: ', actual);
      return expected === actual;
    }
    else if (this.isType('TwoPicture')) {
      return this.d.options[viewComp.pictureCorrectIndex].answered;
    }
    else if (this.isType('FourPicture')) {
      return this.d.options[viewComp.pictureCorrectIndex].answered;
    }
    else if (this.isType('MultiCheck')) {
      for (let i = 0; i < viewComp.choices.length; i++) {
        if (viewComp.choices[i].isCorrect) {
          if (!viewComp.choices[i].picked) {
            return false;
          }
        } else {
          if (viewComp.choices[i].picked) {
            return false;
          }
        }
      }
      return true;
    }
    else if (this.isType('OneCheck')) {
      for (let i = 0; i < viewComp.choices.length; i++) {
        if (viewComp.choices[i].picked === i + 1) {
        if (viewComp.choices[i].isCorrect) {
            return true;
          }
        }
      }
    }
    else if (this.isType('Writing')) {
      const actual = viewComp.writingAnswer.replace(/\s+/g, ' ').trim();
      const expected = actual.indexOf('_') > -1 ? this.writingAnswer() : this.replaceAll(this.writingAnswer(), '_', '');
      const correctPercentage = compareTwoStrings(expected, actual);
      console.log('Writing answer was ', correctPercentage, ' right.', expected, actual);
      if (correctPercentage > this.writingCompareAcceptablePercentage) {
        viewComp.wasAlmostCorrect = correctPercentage === 1 ? false: true;
        return true;
      }
    }
    else if (this.isType('Speaking')) {
      if (this.speakingAnswer) {
        const correctPercentage = compareTwoStrings(this.speakingAnswer(), viewComp.speakingAnswer);
        console.log('Speaking answer was ', correctPercentage, ' right.', this.speakingAnswer(), viewComp.speakingAnswer);
        if (correctPercentage > this.speakCompareAcceptablePercentage) {
          viewComp.wasAlmostCorrect = correctPercentage === 1 ? false : true;
          return true;
        }
      }
    }
    else if (this.isType('Conversation')) {
      if (this.speakingAnswer) {
        const correctPercentage = compareTwoStrings(this.conversationAnswer(viewComp.questionCounter-1), viewComp.speakingAnswer);
        console.log('Speaking answer was ', correctPercentage, ' right.', this.conversationAnswer(viewComp.questionCounter-1), viewComp.speakingAnswer);
        if (correctPercentage > this.speakCompareAcceptablePercentage) {
          viewComp.wasAlmostCorrect = correctPercentage === 1 ? false : true;
          return true;
        }
      }
      viewComp.content.scrollToBottom();
    }
    else if (this.isType('Words')) {
      return viewComp.words[viewComp.questionCounter-1].isAnswerRight(viewComp.wordAnswer);
    }
    else if (this.isType('SpellSelect')) {
      const actual = viewComp.chosens.map((opt) => opt.text).join('');
      const expected = this.lookupWordTarget(this.d.question);
      console.log('Expected: ', expected, ' Actual: ', actual);
      return expected === actual;
    }
    return false;
  }

  isAnswered(viewComp) {
    if (this) {
      if (this.isType('MultiSelect')) {
        return viewComp.chosens.length > 0
      }
      else if (this.isType('OneSelect')) {
        return viewComp.chosen && viewComp.chosen.text;
      }
      else if (this.isType('Writing')) {
        return viewComp.writingAnswer;
      }
      else if (this.isType('MultiCheck') || this.isType('OneCheck')) {
        for (let i = 0; i < viewComp.choices.length; i++) {
          if (viewComp.choices[i].picked) {
            return true;
          }
        }
      }
      else if (this.isType('TwoPicture') || this.isType('FourPicture')) {
        for (let i = 0; i < this.d.options.length; i++) {
          if (this.d.options[i].answered) {
            return true;
          }
        }
      }
      else if (this.isType('SpellSelect')) {
        return viewComp.chosens.length === viewComp.options.length;
      }
    }
    return false;
  }

  resolveRightAnswerString(viewComp, autoCorrect?:boolean): string {
    let result = '';
    if (this.isType('TwoPicture')) {
      result = this.pictureLabel(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('FourPicture')) {
      result = this.pictureLabel(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('MultiCheck')) {
      for (let i = 0; i < viewComp.choices.length; i++) {
        if (viewComp.choices[i].isCorrect) {
          result += viewComp.choices[i].text;
          result += '\n<br>';
        }
      }
    }
    else if (this.isType('OneCheck')) {
      for (let i = 0; i < viewComp.choices.length; i++) {
        if (viewComp.choices[i].isCorrect) {
          result = viewComp.choices[i].text;
        }
      }
    }
    else if (this.isType('Writing')) {
      let expected = viewComp.writingAnswer.indexOf('_') > -1 ? this.writingAnswer() : this.replaceAll(this.writingAnswer(), '_', '');
      viewComp.writingAnswerDiff = diffWords(expected, viewComp.writingAnswer, { ignoreCase: true });
      result = this.writingAnswer();
    }
    else if (this.isType('Speaking')) {
      viewComp.speakingAnswerDiff = diffWords(this.speakingAnswer(), viewComp.speakingAnswer, { ignoreCase: true });
      result = this.speakingAnswer();
    }
    else if (this.isType('Conversation')) {
      viewComp.speakingAnswerDiff = diffWords(this.conversationAnswer(viewComp.questionCounter-1), viewComp.speakingAnswer, { ignoreCase: true });
      result = this.conversationAnswer(viewComp.questionCounter-1);
      viewComp.content.scrollToBottom();
    }
    else if (this.isType('MultiSelect')) {
      const answers = this.multiSelectAnswers();
      result = answers.map((e) => e.text).join(' ');
      if (autoCorrect) {
        for (let i = 0; i < viewComp.chosens.length; i++) {
          let wasIn, wasPositionCorrect = false;
          for (let j = 0; j < answers.length; j++) {
            if (viewComp.chosens[i].text === answers[j].text) {
              wasIn = true;
              if (!wasPositionCorrect) {
                wasPositionCorrect = i === j;
              }
            }
          }
          if (wasIn && wasPositionCorrect) {
            viewComp.chosens[i].class = 'option-correct';
          } else if (wasIn) {
            viewComp.chosens[i].class = 'option-confuse';
          } else {
            viewComp.chosens[i].class = 'option-wrong';
          }
        }
        for (let i = 0; i < viewComp.options.length; i++) {
          if (viewComp.wasWrong || viewComp.wasAlmostCorrect) {
            for (let j = 0; j < answers.length; j++) {
              if (viewComp.options[i].text === answers[j].text) {
                if (viewComp.options[i].class !== 'option-selected') {
                  viewComp.options[i].class = 'option-confuse';
                }
              }
            }
          }
          if (viewComp.options[i].class !== 'option-confuse') {
            viewComp.options[i].class = 'option-selected';
          }
        }
      }
    }
    else {
      result = this.answer;
    }
    if (viewComp.wasWrong) {
      viewComp.description = 'CORRECT_ANSWER';
    } else if (viewComp.wasCorrect) {
      if (viewComp.wasAlmostCorrect) {
        viewComp.description = 'ALMOST_RIGHT';
      } else {
        viewComp.description = 'YOU_WERE_RIGHT';
      }
    }
    viewComp.rightAnswerString = result;
    return result;
  }

  isType(type: string): boolean {
    return this.type.toString() === type;
  }

  public isN(): boolean {
    return this.isNormal();
  }

  public isR(): boolean {
    return this.isReverse();
  }

  public isReverse(): boolean {
    return this.d.reverse;
  }

  public isNormal(): boolean {
    return !this.isReverse();
  }

  private replaceWords(array: any[], dir: string, removeDot?:boolean): any[] {
    try {
      const result = JSON.parse(JSON.stringify(array));
      result.forEach((option) => {
        if (this.lookupWords[option.text]) {
          option.text = this.determineOptionValue(option, dir, removeDot);
        }
      });
      return result;
    } catch (error) {
      console.log('Error on parse dynamicPart: ', array, dir);
      return [];
    }
  }

  public oneCheckChoices(): any[] {
    return this.isNormal() ? this.motherOptions : this.targetOptions;
  }

  public multiSelectAnswers(): any[] {
    const arr = /\s/.test(this.answer) ? this.answer.split(' ') : [this.answer];
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      res[i] = { order: i, text: arr[i]};
    }
    return res;
  }

  public multiSelectOptions(): any[] {
    return this.isNormal() ? this.mmultiSelectOptions : this.tmultiSelectOptions;
  }

  public oneSelectOptions(): any[] {
    if (!this.oneSelectOptionsProperty) {
      const targetSentence = this.lookupWordTarget(this.d.question);
      const optionSentence = this.lookupWordTarget(this.d.option);
      let options = [];
      optionSentence.split(' ').forEach((word) => options.push({text: word}));
      let doc = npl(targetSentence);
      const blankWord = doc.nouns().data()[QuestionUtil.randomBetween(0, doc.nouns().data().length-1)].text;
      this.oneSelectBeforeAnswer = targetSentence.substring(0, targetSentence.indexOf(blankWord));
      this.oneSelectAfterAnswer = targetSentence.substring(targetSentence.indexOf(blankWord) + blankWord.length, targetSentence.length);
      options.push({text: blankWord});
      this.oneSelectOptionsProperty = this.shuffle(options);
    }
    return this.oneSelectOptionsProperty;
  }

  public spellSelectOptions(): any[] {
    if (!this.spellSelectOptionsProperty) {
      const word: string = this.lookupWordTarget(this.d.question), options = [];
      word.toString().split('').forEach((option) => options.push({ text: option}));
      this.spellSelectOptionsProperty = this.shuffle(options);
    }
    return this.spellSelectOptionsProperty;
  }

  public pictureLabel(index): string {
    return this.isNormal() ? this.motherOptions[index].text : this.targetOptions[index].text;
  }

  public pictureQuestion(index): string {
    return this.isNormal() ? this.targetOptions[index].text : this.motherOptions[index].text;
  }

  get pictureUrl(): string {
    return `${IMAGE_ORIGIN}lessons/${this.lookupWords[this.d.question]['e']}.jpeg`;
  }

  public writingAnswer(): string {
    let writingAnswer = this.answer;
    return this.replaceAll(writingAnswer, '‌', ' '); // Replaces in Farsi keyboard(SHIFT+SPACE) character with simple space.
  }

  public speakingAnswer(): string {
    let answer: string = this.face(null);
    answer = answer && answer.indexOf('.') > -1 ? this.replaceAll(answer, '.', ' .') : answer;
    answer = answer && answer.indexOf('?') > -1 ? this.replaceAll(answer, '?', ' ?') : answer;
    return this.replaceAll(answer, '_', '');
  }

  public conversationAnswer(index: number): string {
    if (this.targetOptions[index] || this.motherOptions[index]) {
      return this.isNormal() ? this.targetOptions[index].text : this.motherOptions[index].text;
    }
    return "";
  }

  public face(viewComp): string {
    if (this.isType('TwoPicture')) {
      return this.pictureQuestion(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('FourPicture')) {
      return this.pictureQuestion(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('OneCheck')) {
      return this.isNormal() ? this.toneCheckAnswer ? this.toneCheckAnswer.text : ''
                             : this.moneCheckAnswer ? this.moneCheckAnswer.text : '';
    }
    else {
      if (this.lookupWords[this.d.question]) {
        return this.isNormal() ? this.lookupWordTarget(this.d.question): this.lookupWordMother(this.d.question);
      }
    }
  }

  public faceForSpeak(viewComp): string {
    let res = '';
    if (this.isType('TwoPicture')) {
      res = this.pictureLabel(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('FourPicture')) {
      res = this.pictureLabel(viewComp.pictureCorrectIndex);
    }
    else if (this.isType('Conversation')) {
      res = this.conversationAnswer(viewComp.questionCounter-1);
    }
    else if (this.isType('OneCheck')) {
      res = this.toneCheckAnswer ? this.toneCheckAnswer.text : '';
    }
    else if (this.isType('Words')) {
      console.log('noTotal', viewComp.noTotal, ' wordsInQueue', viewComp.words.length ,' questionCounter', viewComp.questionCounter, ' questionsLength', this.d.options.length, ' targeted', viewComp.questionCounter - this.d.options.length);
      if (viewComp.questionCounter > this.d.options.length) {
        res = this.targetOptions[(viewComp.questionCounter - this.d.options.length)-1].text;
      } else {
        res = this.targetOptions[viewComp.questionCounter-1].text;
      }
    }
    else if (this.isType('OneSelect')) {
      if (!viewComp.isInContinueState)
        res = this.oneSelectBeforeAnswer + (viewComp.chosen && viewComp.chosen.text ?
          viewComp.chosen.text : '') + this.oneSelectAfterAnswer;
      else
        res = this.lookupWordTarget(this.d.question);
    }
    else {
      res = this.lookupWordTarget(this.d.question);
    }
    return this.replaceAll(res, '_', '');
  }

  get answer(): string {
    const answer = this.isNormal()
      ? this.lookupWords[this.d.question]['c'] ? this.capitalizeFirstLetter(this.lookupWordMother(this.d.question)) : this.lookupWordMother(this.d.question)
      : this.lookupWords[this.d.question]['c'] ? this.capitalizeFirstLetter(this.lookupWordTarget(this.d.question)) : this.lookupWordTarget(this.d.question);
    return answer;
  }

  get tmultiSelectOptions(): any[] {
    if (this.targetMultiSelectOptions) {
      return this.targetMultiSelectOptions;
    }
    const extra = this.targetOptions.length > 0 ? JSON.parse(JSON.stringify(this.targetOptions)) : [];
    this.targetMultiSelectOptions = this.resolveMultiSelectOptionWithLimit(this.multiSelectAnswers(), extra);
    return this.targetMultiSelectOptions;
  }

  get mmultiSelectOptions(): any[] {
    if (this.motherMultiSelectOptions) {
      return this.motherMultiSelectOptions;
    }
    const extra = this.motherOptions.length > 0 ? JSON.parse(JSON.stringify(this.motherOptions)) : [];
    this.motherMultiSelectOptions = this.resolveMultiSelectOptionWithLimit(this.multiSelectAnswers(), extra);
    return this.motherMultiSelectOptions;
  }

  private resolveMultiSelectOptionWithLimit(original, extra) {
    const origOptions = this.splitOptions(original);
    if (origOptions.length >= 8) {
      const res = [];
      origOptions.forEach((option) => res.push({ text: option}));
      return this.shuffle(res);
    }
    const extraOptions = this.splitOptions(extra);
    for (let i = 0; i < 9 - origOptions.length; i++) {
      if (i < extraOptions.length && origOptions.indexOf(extraOptions[i]) === -1) {
        origOptions.push(extraOptions[i]);
      }
    }
    const res = [];
    origOptions.forEach((option) => res.push({ text: option}));
    return this.shuffle(res);
  }

  private toptions(removeDot?: boolean): any[] {
    if (this.targetOptions) {
      return this.targetOptions;
    }
    this.targetOptions = this.replaceWords(this.d.options, 't', removeDot);
    return this.targetOptions;
  }

  private moptions(removeDot?: boolean): any[] {
    if (this.motherOptions) {
      return this.motherOptions;
    }
    this.motherOptions = this.replaceWords(this.d.options, 'm', removeDot);
    return this.motherOptions;
  }

  get toneCheckAnswer(): any {
    if (this.targetOneCheckAnswer) {
      return this.targetOneCheckAnswer;
    }
    for (let i = 0; i < this.targetOptions.length; i++) {
      if (this.targetOptions[i].isCorrect) {
        this.targetOneCheckAnswer = this.targetOptions[i];
        return this.targetOneCheckAnswer;
      }
    }
  }

  get moneCheckAnswer(): any {
    if (this.motherOneCheckAnswer) {
      return this.motherOneCheckAnswer;
    }
    for (let i = 0; i < this.motherOptions.length; i++) {
      if (this.motherOptions[i].isCorrect) {
        this.motherOneCheckAnswer = this.motherOptions[i];
        return this.motherOneCheckAnswer;
      }
    }
  }

  private lookupWordTarget(indexOrder) {
    return this.lookupWords[indexOrder]['ts'][0].w;
  }

  private lookupWordMother(indexOrder) {
    return this.lookupWords[indexOrder]['ms'][0].w;
  }

  public shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  splitOptions(array) {
    let result = [];
    array.forEach((option: any) => {
      if (/\s/.test(option.text)) {
        option.text.split(' ').forEach((suboption) => {
          result.push(suboption);
        });
      } else {
        result.push(option.text);
      }
    });
    return result;
  }

  private determineOptionValue(option: any, dir: string, removeDot?: boolean): string {
    const result = dir === 't' ? this.lookupWordTarget(option.text) : this.lookupWordMother(option.text);
    return removeDot ? this.replaceAll(result, '.', '') : result;
  }

  public capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  public replaceAll(str, find, replace) {
      return str ? str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace) : null;
  }

}