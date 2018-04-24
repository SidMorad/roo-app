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
    for (let i = 0; i < question.motherOptions.length; i++) {
      const answer = question.motherOptions[i];
      const option0 = this.randomTargetOption(i, question);
      const bool = this.randomBoolean();
      const option1 = bool ? question.targetOptions[i].text : option0;
      const option2 = bool ? option0 : question.targetOptions[i].text;
      result.push(new TwoWord(answer.text, option1, option2, bool));
    }
    for (let i = 0; i < question.targetOptions.length; i++) {
      const tAnswer = question.targetOptions[i];
      const tOption0 = this.randomMotherOption(i, question);
      const tBool = this.randomBoolean();
      const tOption1 = tBool ? question.motherOptions[i].text : tOption0;
      const tOption2 = tBool ? tOption0 : question.motherOptions[i].text;
      result.push(new TwoWord(tAnswer.text, tOption1, tOption2, tBool));
    }
    return result;
  }

  public static randomTargetOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.targetOptions.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.targetOptions[randomIndex].text;
  }

  public static randomMotherOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.motherOptions.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.motherOptions[randomIndex].text;
  }

  public static randomBoolean(): boolean {
    return Math.random() >= 0.5;
  }

  public static randomBeetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}