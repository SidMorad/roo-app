import { TranslDir } from './transl-dir';

export class Lesson {
  constructor(
    public uuid?: string,
    public title?: string,
    public translDir?: TranslDir,
    public indexOrder?: number
  ) { }

  isMotherLangRTL(): boolean {
    const langs = (this.translDir+'').split('$');
    return langs[0] === 'FA';
  }

  isTargetLangLTR(): boolean {
    const langs = (this.translDir+'').split('$');
    return langs[1] !== 'FA';
  }

}

