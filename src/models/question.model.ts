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

  public writingAnswer(): string {
    return this.isNormal() ? this.m.question : this.t.question;
  }

  public speakingAnswer(): string {
    return this.isNormal() ? this.t.question : this.m.question;
  }

}