import { TranslDir } from './transl-dir';

export class Lesson {
  constructor(
    public uuid?: string,
    public title?: string,
    public translDir?: TranslDir,
    public indexOrder?: number
  ) { }

  isMotherLangRTL(): boolean {
    return this.motherLanguage() === 'FA';
  }

  isTargetLangLTR(): boolean {
    return this.targetLanguage() !== 'FA';
  }

  langs(): any {
    return (this.translDir+'').split('$');
  }

  motherLanguage(): string {
    return this.langs()[1];
  }

  targetLanguage(): string {
    return this.langs()[1];
  }

  targetLocale(): string {
    switch(this.targetLanguage()) {
      case 'EN_UK':
        return 'en-GB';
      case 'DE':
        return 'de';
      default:
        return 'en-GB';
    }
  }

}
