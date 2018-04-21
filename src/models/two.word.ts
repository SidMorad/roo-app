import { Question } from './question.model';


export class TwoWord {
  constructor(public question?: string,
              public option1?: string,
              public option2?: string,
              public was1or2?: boolean) {
  }

  isAnswerRight(answer: boolean) {
    return this.was1or2 !== answer;
  }

  public static toTwoWordList(question: Question): TwoWord[] {
    const result: TwoWord[] = [];
    for (let i = 0; i < question.moptions.length; i++) {
      const answer = question.moptions[i];
      const option0 = this.randomTargetOption(i, question);
      const bool = this.randomBoolean();
      const option1 = bool ? question.toptions[i].text : option0;
      const option2 = bool ? option0 : question.toptions[i].text;
      result.push(new TwoWord(answer.text, option1, option2, bool));
    }
    for (let i = 0; i < question.toptions.length; i++) {
      const tAnswer = question.toptions[i];
      const tOption0 = this.randomMotherOption(i, question);
      const tBool = this.randomBoolean();
      const tOption1 = tBool ? question.moptions[i].text : tOption0;
      const tOption2 = tBool ? tOption0 : question.moptions[i].text;
      result.push(new TwoWord(tAnswer.text, tOption1, tOption2, tBool));
    }
    return result;
  }

  public static randomTargetOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.toptions.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.toptions[randomIndex].text;
  }

  public static randomMotherOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.moptions.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.moptions[randomIndex].text;
  }

  public static randomBoolean(): boolean {
    return Math.random() >= 0.5;
  }

  public static randomBeetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}