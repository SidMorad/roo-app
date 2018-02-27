import { QuestionType } from './question-type';

export class Question {
  constructor(
    public type?: QuestionType,
    public description?: string,
    public dynamicPart?: string,
    public binaryPart?: string,
    public indexOrder?: number,
    public d?: any, // dynamicPart object
    public b?: any  // binaryPart object
  ) { }
}