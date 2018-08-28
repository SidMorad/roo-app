import { IMAGE_ORIGIN } from '../app/app.constants';
import { ScoreType } from './';

export class Lesson {
  constructor(
    public type?: ScoreType,
    public uuid?: string,
    public title?: string,
    public learnDir?: string,
    public indexOrder?: number,
    public picture?: string
  ) { }

  isMotherLangRTL(): boolean {
    return this.motherLanguage() === 'FA_IR';
  }

  isTargetLangLTR(): boolean {
    return !(this.targetLanguage() === 'FA_IR' || this.targetLanguage() === 'HE_IL' || this.targetLanguage() === 'AR_SA');
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

  targetLocale(isAndroid: boolean): string {
    if (this.targetLanguage() === 'ZH_CN' && isAndroid) {
      return 'cmn-Hans-CN';
    }
    const lang = this.targetLanguage().split('_')[0].toLowerCase();
    const country = this.targetLanguage().split('_')[1].toUpperCase();
    return `${lang}-${country}`;
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

  get titleKey(): string {
    return this.indexOrder === 70 ? 'LESSON_TYPE_CONVERSATION' : this.indexOrder === 80 ? 'LESSON_TYPE_WORDS' : 'LESSON_TYPE_LESSON';
  }

  get pictureUrl(): string {
    return `${IMAGE_ORIGIN}/lessons/${this.picture}`;
  }

}
