import { TranslDir } from './transl-dir';

export class ScoreLookup {
  constructor(
    public total?: number,
    public translDir?: TranslDir,
    public categoryMap?: any,
    public lessonMap?: any
  ) { }
}