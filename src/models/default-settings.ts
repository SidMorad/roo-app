
export class DefaultSettings {
  constructor(public profileFirstLoaded: boolean,
              public language: string,
              public autoPlayVoice: boolean,
              public autoContinue: boolean,
              public voiceSpeedRate: number,
              public dname: string,
              public translDir: string) {
  }

  public static newInstance(): DefaultSettings {
    return new DefaultSettings(false, 'fa', true, true, 80, 'Guest', 'FA$EN_UK');
  }

}