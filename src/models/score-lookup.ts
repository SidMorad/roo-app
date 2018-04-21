import { LearnDir } from './learn-dir';

export class ScoreLookup {
  constructor(
    public total?: number,
    public learnDir?: LearnDir,
    public categoryMap?: any,
    public lessonMap?: any
  ) { }
}