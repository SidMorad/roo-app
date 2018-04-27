
export class Lesson {
  constructor(
    public uuid?: string,
    public title?: string,
    public learnDir?: string,
    public indexOrder?: number
  ) { }

  isMotherLangRTL(): boolean {
    return this.motherLanguage() === 'FA_IR';
  }

  isTargetLangLTR(): boolean {
    return this.targetLanguage() !== 'FA_IR';
  }

  langs(): any {
    return this.learnDir.split('$');
  }

  motherLanguage(): string {
    return this.langs()[0];
  }

  targetLanguage(): string {
    return this.langs()[1];
  }

  targetLocale(): string {
    switch(this.targetLanguage()) {
      case 'EN_GB':
        return 'en-GB';
      case 'DE_DE':
        return 'de-DE';
      default:
        return 'en-GB';
    }
  }

  get motherLangKey(): string {
    return this.motherLanguage().split('_')[0];
  }

  get targetLangKey(): string {
    return this.targetLanguage().split('_')[0];
  }

  isClassRTL(reverse: boolean): boolean {
    return this.isMotherLangRTL() && reverse;
  }

  isClassLTR(reverse: boolean): boolean {
    return !this.isClassRTL(reverse);
  }

}
