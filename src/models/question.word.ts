import { Question } from './question.model';


export class QuestionWord {
  constructor(public question?: string,
              public option1?: string,
              public option2?: string,
              public was1or2?: boolean) {
  }

  isAnswerRight(answer: boolean) {
    return this.was1or2 !== answer;
  }

  public static toQuestionWordList(question: Question): QuestionWord[] {
    const result: QuestionWord[] = [];
    for (let i = 0; i < question.m.answers.length; i++) {
      const answer = question.m.answers[i];
      const option0 = this.randomTargetOption(i, question);
      const bool = this.randomBoolean();
      const option1 = bool ? question.t.answers[i].text : option0;
      const option2 = bool ? option0 : question.t.answers[i].text;
      result.push(new QuestionWord(answer.text, option1, option2, bool));
    }
    for (let i = 0; i < question.t.answers.length; i++) {
      const tAnswer = question.t.answers[i];
      const tOption0 = this.randomMotherOption(i, question);
      const tBool = this.randomBoolean();
      const tOption1 = tBool ? question.m.answers[i].text : tOption0;
      const tOption2 = tBool ? tOption0 : question.m.answers[i].text;
      result.push(new QuestionWord(tAnswer.text, tOption1, tOption2, tBool));
    }
    return result;
  }

  public static randomTargetOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.t.answers.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.t.answers[randomIndex].text;
  }

  public static randomMotherOption(forbiddenIndex: number, question: Question): string {
    let randomIndex = forbiddenIndex;
    while (randomIndex === forbiddenIndex) {
      randomIndex = this.randomBeetween(0, question.m.answers.length-1);
    }
    console.log('forbiddenIndex', forbiddenIndex, 'randomIndex', randomIndex);
    return question.m.answers[randomIndex].text;
  }

  public static randomBoolean(): boolean {
    return Math.random() >= 0.5;
  }

  public static randomBeetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}