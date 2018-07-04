
export class DefaultSettings {
  constructor(public profileFirstLoaded: boolean,
              public language: string,
              public autoPlayVoice: boolean,
              public autoContinue: boolean,
              public voiceSpeedRate: number,
              public dname: string,
              public learnDir: string,
              public difficultyLevel: string,
              public notificationEnabled: boolean,
              public notificationDailyAt: string,
              public advertismentEnabled: boolean) {
  }

  public static newInstance(): DefaultSettings {
    return new DefaultSettings(false, 'fa', true, true, 80, 'Guest', 'FA_IR$EN_GB', 'Beginner', true, '10:00', false);
  }

  get motherLanguage(): string {
    return this.learnDir.split('$')[0];
  }

  get targetLanguage(): string {
    return this.learnDir.split('$')[1];
  }

  set motherLanguage(val) {
    console.log('DefaultSettings#setMotherLanguage', val);
  }

  set targetLanguage(val) {
    console.log('DefaultSettings#setTargetLanguage', val);
  }

}