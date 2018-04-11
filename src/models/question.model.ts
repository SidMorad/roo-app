import { compareTwoStrings } from 'string-similarity';
import { diffWords } from 'diff';

import { QuestionType } from './question-type';

export class Question {
  constructor(
    public uuid?: string,
    public type?: QuestionType,
    public description?: string,
    public indexOrder?: number,
    public dynamicPart?: string,
    public motherPart?: string,
    public targetPart?: string,
    public d?: any, // dynamicPart object
    public m?: any, // motherPart object
    public t?: any  // targetPart object
  ) { }

  public readonly textCompareAcceptablePercentage: number = 0.8;
  public readonly speakCompareAcceptablePercentage: number = 0.7;
  public readonly writingCompareAcceptablePercentage: number = 0.7;

  isAnswerRight(viewComp) {
    if (this.isType('MultiSelect')) {
      const answers: any[] = this.multiSelectAnswers();
      let expected = answers.map((x) => x.text).join(' ');
      let actual = viewComp.chosens.map((x) => x.text).join(' ');
      const correctPercentage = compareTwoStrings(expected, actual);
      console.log('Multi answer was ', correctPercentage, ' right.', expected, actual);
      if (correctPercentage > this.textCompareAcceptablePercentage) {
        viewComp.wasAlmostCorrect = correctPercentage === 1 ? false : true;
        return true;
      }
    }
    else if (this.isType('TwoPicture')) {
      return this.d.pics[viewComp.twoPictureCorrectIndex].answered;
    }
    else if (this.isType('FourPicture')) {
      return this.d.pics[viewComp.fourPictureCorrectIndex].answered;
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
      else if (this.isType('MultiCheck') || this.isType('OneCheck')) {
        for (let i = 0; i < viewComp.choices.length; i++) {
          if (viewComp.choices[i].picked) {
            return true;
          }
        }
      }
      else if (this.isType('TwoPicture') || this.isType('FourPicture')) {
        for (let i = 0; i < this.d.pics.length; i++) {
          if (this.d.pics[i].answered) {
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
          let wasIn = false;
          for (let j = 0; j < answers.length; j++) {
            if (viewComp.chosens[i].text === answers[j].text) {
              wasIn = true;
            }
          }
          if (wasIn) {
            viewComp.chosens[i].class = 'part-added';
          } else {
            viewComp.chosens[i].class = 'part-removed';
          }
        }
        for (let i = 0; i < viewComp.options.length; i++) {
          for (let j = 0; j < answers.length; j++) {
            if (viewComp.options[i].text === answers[j].text) {
              viewComp.options[i].class = 'part-added';
            }
          }
        }
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

  public oneCheckChoices(): string[] {
    return this.isNormal() ? this.m.choices.slice() : this.t.choices.slice();
  }

  public multiSelectAnswers(): any[] {
    return this.isNormal() ? this.m.answers.slice() : this.t.answers.slice();
  }

  public multiSelectOptions(): string[] {
    return this.isNormal() ? this.m.options.slice() : this.t.options.slice();
  }

  public pictureLabel(index): string {
    return this.isNormal() ? this.m.pics[index].answer : this.t.pics[index].answer;
  }

  public pictureQuestion(index): string {
    return this.isNormal() ? this.t.pics[index].answer : this.m.pics[index].answer;
  }

  public writingAnswer(): string {
    return this.isNormal() ? this.m.question : this.t.question;
  }

  public speakingAnswer(): string {
    return this.isNormal() ? this.t.question : this.m.question;
  }

  public conversationAnswer(index: number): string {
    return this.isNormal() ? this.t.answers[index].text : this.m.answers[index].text;
  }

}