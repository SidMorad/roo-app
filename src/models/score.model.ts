import { ScoreType } from './score-type';

export class Score {
  constructor(
    public type?: ScoreType,
    public learnDir?: string,
    public score?: number,
    public star?: number,
    public lessonUuid?: string,
    public categoryUuid?: string
  ) { }
}