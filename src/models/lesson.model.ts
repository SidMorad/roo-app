import { TranslDir } from './transl-dir';

export class Lesson {
  constructor(
    public uuid?: string,
    public title?: string,
    public translDir?: TranslDir,
    public indexOrder?: number
  ) { }

  isFromLangRTL(): boolean {
    const langs = (this.translDir+'').split('$');
    return langs[0] === 'FA';
  }

}

