import { compareTwoStrings } from 'string-similarity';
import { diffWords } from 'diff';

import { QuestionType } from './question-type';

export class Question {
  constructor(
    public uuid?: string,
    public type?: QuestionType,
    public indexOrder?: number,
    public dynamicPart?: string,
    public d?: any, // dynamicPart object
    public lookupWords?: any
  ) {
  }

  public readonly textCompareAcceptablePercentage: number = 0.8;
  public readonly multiSelectCompareAcceptablePercentage: number = 0.8;
  public readonly speakCompareAcceptablePercentage: number = 0.7;
  public readonly writingCompareAcceptablePercentage: number = 0.7;
  private targetOptions: any[];             private motherOptions: any[];
  private targetMultiSelectOptions: any[];  private motherMultiSelectOptions: any[];
  private targetOneCheckAnswer: any;         private motherOneCheckAnswer: any;

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
    else if (this.isType('TwoPicture')) {
      return this.d.options[viewComp.twoPictureCorrectIndex].answered;
    }
    else if (this.isType('FourPicture')) {
      return this.d.options[viewComp.fourPictureCorrectIndex].answered;
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
      const expected = this.writingAnswer();
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
    return false;
  }

  isAnswered(viewComp) {
    if (this) {
      if (this.isType('MultiSelect')) {
        return viewComp.chosens.length > 0
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
    }
    return false;
  }

  resolveRightAnswerString(viewComp, autoCorrect?:boolean): string {
    let result = '';
    if (this.isType('TwoPicture')) {
      result = this.pictureLabel(viewComp.twoPictureCorrectIndex);
    }
    else if (this.isType('FourPicture')) {
      result = this.pictureLabel(viewComp.fourPictureCorrectIndex);
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
      viewComp.writingAnswerDiff = diffWords(this.writingAnswer(), viewComp.writingAnswer, { ignoreCase: true });
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
              wasPositionCorrect = i === j;
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
          for (let j = 0; j < answers.length; j++) {
            if (viewComp.options[i].text === answers[j].text) {
              if (viewComp.options[i].class !== 'option-selected') {
                viewComp.options[i].class = 'option-confuse';
              }
            }
          }
          if (viewComp.options[i].class !== 'option-confuse') {
            viewComp.options[i].class = 'option-selected';
          }
        }
      }
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

  private replaceWords(array: any[], prop: string, dir: string): any[] {
    const result = JSON.parse(JSON.stringify(array));
    result.forEach((row) => {
      if (this.lookupWords[row[prop]]) {
        row[prop] = this.lookupWords[row[prop]][dir];
      }
    });
    return result;
  }

  public oneCheckChoices(): any[] {
    return this.isNormal() ? this.moptions : this.toptions;
  }

  public multiSelectAnswers(): any[] {
    const arr = this.answer.split(' ');
    const res = [];
    for (let i = 0; i < arr.length; i++) {
      res[i] = { order: i, text: arr[i]};
    }
    return res;
  }

  public multiSelectOptions(): any[] {
    return this.isNormal() ? this.mmultiSelectOptions : this.tmultiSelectOptions;
  }

  public pictureLabel(index): string {
    return this.isNormal() ? this.moptions[index].text : this.toptions[index].text;
  }

  public pictureQuestion(index): string {
    return this.isNormal() ? this.toptions[index].text : this.moptions[index].text;
  }

  public writingAnswer(): string {
    return this.answer;
  }

  public speakingAnswer(): string {
    return this.face;
  }

  public conversationAnswer(index: number): string {
    return this.isNormal() ? this.toptions[index].text : this.moptions[index].text;
  }

  get face(): string {
    if (this.isType('OneCheck')) {
      return this.isNormal() ? this.toneCheckAnswer ? this.toneCheckAnswer.text : ''
                             : this.moneCheckAnswer ? this.moneCheckAnswer.text : '';
    }
    else {
      return this.isNormal() ? this.lookupWords[this.d.question]['target']: this.lookupWords[this.d.question]['mother'];
    }
  }

  get answer(): string {
    return this.isNormal() ? this.lookupWords[this.d.question]['mother']: this.lookupWords[this.d.question]['target'];
  }

  get tmultiSelectOptions(): any[] {
    if (this.targetMultiSelectOptions) {
      return this.targetMultiSelectOptions;
    }
    const toptions = JSON.parse(JSON.stringify(this.toptions));
    this.targetMultiSelectOptions = this.shuffle(toptions.concat(this.multiSelectAnswers()));
    return this.targetMultiSelectOptions;
  }

  get mmultiSelectOptions(): any[] {
    if (this.motherMultiSelectOptions) {
      return this.motherMultiSelectOptions;
    }
    const moptions = JSON.parse(JSON.stringify(this.moptions));
    this.motherMultiSelectOptions = this.shuffle(moptions.concat(this.multiSelectAnswers()));
    return this.motherMultiSelectOptions;
  }

  get toptions(): any[] {
    if (this.targetOptions) {
      return this.targetOptions;
    }
    this.targetOptions = this.replaceWords(this.d.options, 'text', 'target');
    return this.targetOptions;
  }

  get moptions(): any[] {
    if (this.motherOptions) {
      return this.motherOptions;
    }
    this.motherOptions = this.replaceWords(this.d.options, 'text', 'mother');
    return this.motherOptions;
  }

  get toneCheckAnswer(): any {
    if (this.targetOneCheckAnswer) {
      return this.targetOneCheckAnswer;
    }
    this.toptions.forEach((row) => {
      if (row.isCorrect) {
        this.targetOneCheckAnswer = row;
        return this.targetOneCheckAnswer;
      }
    });
  }

  get moneCheckAnswer(): any {
    if (this.motherOneCheckAnswer) {
      return this.motherOneCheckAnswer;
    }
    this.moptions.forEach((row) => {
      if (row.isCorrect) {
        this.motherOneCheckAnswer = row;
        return this.motherOneCheckAnswer;
      }
    });
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

}