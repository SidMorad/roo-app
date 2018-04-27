import { LearnDir } from './learn-dir';
import { DifficultyLevel } from './difficulty-level';

export class ScoreLookup {
  constructor(
    public total?: number,
    public learnDir?: LearnDir,
    public difficultyLevel?: DifficultyLevel,
    public categoryMap?: any,
    public lessonMap?: any
  ) { }
}