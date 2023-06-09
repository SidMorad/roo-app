import { Injectable } from '@angular/core';

@Injectable()
export class Memory {

  private lessonDoneSuccessfully: boolean;
  private numberOfDoneLessons: number;
  private previousScoreLevel: number;
  private allLanguages: any[];

  constructor() {
    this.initAllLanguages();
  }

  public setLessonDoneSuccessfully(value: boolean) {
    this.lessonDoneSuccessfully = value;
  }

  public isLessonDoneSuccessfully(): boolean {
    return this.lessonDoneSuccessfully;
  }

  public setNumberOfDoneLessons(value: number) {
    this.numberOfDoneLessons = value;
  }

  public getNumberOfDoneLessons(): number {
    return this.numberOfDoneLessons;
  }

  public setPreviousScoreLevel(value: number) {
    this.previousScoreLevel = value;
  }

  public getPreviousScoreLevel() {
    return this.previousScoreLevel;
  }

  public betaLanguages() {
    return [
      { translateKey: 'LANG_SPANISH', value: 'ES_ES', flag: 'es' },
      { translateKey: 'LANG_FRENCH', value: 'FR_FR', flag: 'fr' },
      { translateKey: 'LANG_ITALIAN', value: 'IT_IT', flag: 'it' },
      { translateKey: 'LANG_RUSSIAN', value: 'RU_RU', flag: 'ru' },
      { translateKey: 'LANG_JAPANESE', value: 'JA_JP', flag: 'jp' },
      { translateKey: 'LANG_KOREAN', value: 'KO_KR', flag: 'kr' },
      { translateKey: 'LANG_CHINESE', value: 'ZH_CN', flag: 'cn' },
      { translateKey: 'LANG_TURKISH', value: 'TR_TR', flag: 'tr' },
      { translateKey: 'LANG_ARABIC', value: 'AR_SA', flag: 'sa' },
      { translateKey: 'LANG_HEBREW', value: 'HE_IL', flag: 'il' },
      { translateKey: 'LANG_PORTUGUESE', value: 'PT_PT', flag: 'pt' },
      { translateKey: 'LANG_DUTCH', value: 'NL_NL', flag: 'nl' },
      { translateKey: 'LANG_SWEDEN', value: 'SV_SE', flag: 'se' },
      { translateKey: 'LANG_NORWEGIAN', value: 'NB_NO', flag: 'no' },
      { translateKey: 'LANG_DANISH', value: 'DA_DK', flag: 'dk' },
      { translateKey: 'LANG_FINNISH', value: 'FI_FI', flag: 'fi' },
      { translateKey: 'LANG_GREEK', value: 'EL_GR', flag: 'gr' },
      { translateKey: 'LANG_ROMANIAN', value: 'RO_RO', flag: 'ro' },
      { translateKey: 'LANG_AFRIKAANS', value: 'AF_ZA', flag: 'za' },
      { translateKey: 'LANG_CROATIAN', value: 'HR_HR', flag: 'hr' },
      { translateKey: 'LANG_POLISH', value: 'PL_PL', flag: 'pl' },
      { translateKey: 'LANG_BULGARIAN', value: 'BG_BG', flag: 'bg' },
      { translateKey: 'LANG_CZECH', value: 'CS_CZ', flag: 'cz' },
      { translateKey: 'LANG_HUNGARIAN', value: 'HU_HU', flag: 'hu' },
      { translateKey: 'LANG_UKRAINIAN', value: 'UK_UA', flag: 'ua' },
      { translateKey: 'LANG_VIETNAMESE', value: 'VI_VN', flag: 'vn' },
      { translateKey: 'LANG_HINDI', value: 'HI_IN', flag: 'in' },
      { translateKey: 'LANG_INDONESIAN', value: 'ID_ID', flag: 'id' },
      { translateKey: 'LANG_THAI', value: 'TH_TH', flag: 'th' }
    ];
  }

  private initAllLanguages() {
    this.allLanguages = [];
    this.allLanguages['DE_DE'] = { translateKey: 'LANG_GERMAN', value: 'ES_ES', flag: 'de' };
    this.allLanguages['EN_GB'] = { translateKey: 'LANG_ENGLISH', value: 'EN_GB', flag: 'gb' };
    this.allLanguages['FA_IR'] = { translateKey: 'LANG_PERSIAN', value: 'FA_IR', flag: 'ir' };
    for (let i = 0; i < this.betaLanguages().length; i++) {
      this.allLanguages[this.betaLanguages()[i].value] = this.betaLanguages()[i];
    }
  }

  public translateKeyFor(languageCode: string) {
    return this.allLanguages[languageCode].translateKey;
  }

}
