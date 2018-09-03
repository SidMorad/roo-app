
export class TranslateCommand {
  constructor(
    public from?: string,
    public to?: string,
    public text?: string
  ) {
    this.fixLangCodesForGoogleApi();
  }

  fixLangCodesForGoogleApi() {
    if (this.to === 'zh') {
      this.to = 'zh-cn';
    }
    if (this.to === 'he') {
      this.to = 'iw';
    }
    if (this.to === 'nb') {
      this.to = 'no';
    }
  }

}