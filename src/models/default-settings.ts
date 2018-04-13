
export class DefaultSettings {
  constructor(profileFirstLoaded: boolean,
      language: string,
      autoPlayVoice: boolean,
      autoContinue: boolean,
      voiceSpeedRate: number,
      dname: string) {
  }

  public static newInstance(): DefaultSettings {
    return new DefaultSettings(false, 'fa', true, true, 80, 'Question');
  }

}