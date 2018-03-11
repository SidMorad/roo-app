import { ScoreType } from './score-type';
import { TranslDir } from './transl-dir';

export class Score {
  constructor(
    public type?: ScoreType,
    public translDir?: TranslDir,
    public score?: number,
    public noWrong?: number,
    public lessonUuid?: string,
    public categoryUuid?: string
  ) { }
}