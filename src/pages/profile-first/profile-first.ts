import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, ViewController, NavParams, Platform } from 'ionic-angular';

import { Settings, Api, Principal, Memory } from '../../providers';
import { DefaultSettings, Account } from '../../models';

/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-profile-first',
  templateUrl: 'profile-first.html'
})
export class ProfileFirstPage {
  // Our local settings object
  options: any = {};
  settingsReady = false;
  form: FormGroup;
  page: string = 'main';
  pageTitleKey: string = 'SETTINGS_PAGE_PROFILE';
  pageTitle: string;
  isLoading: boolean;
  private unregisterBackButtonAction: any;
  showBetaLangs: boolean;
  betaLanguage = 'ES_ES'; // init Spanish
  betaLanguages: any[];
  betaLanguageRows: any;
  betaCompletedPercentage: string;
  betaCompletedPercentageIsInProgress: boolean;

  constructor(private viewCtrl: ViewController, private api: Api,
    private settings: Settings, private formBuilder: FormBuilder,
    private navParams: NavParams, private translate: TranslateService,
    private principal: Principal, private platform: Platform, private memory: Memory) {
    this.betaLanguages = this.memory.betaLanguages();
    this.betaLanguageRows = Array.from(Array(Math.ceil(this.betaLanguages.length / 3)).keys());
    this.betaLanguageClicked(this.betaLanguage);
  }

  _buildForm() {
    let group: any = {
      dname: [this.options.dname],
      motherLanguage: [this.options.motherLanguage],
      targetLanguage: [this.options.targetLanguage],
      difficultyLevel: [this.options.difficultyLevel]
    };

    this.form = this.formBuilder.group(group);

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      if (v.motherLanguage === 'EN_GB' && v.targetLanguage === 'EN_GB') {
        this.form.controls['motherLanguage'].setValue('FA_IR');
      }
      if (v.motherLanguage === 'DE_DE' && v.targetLanguage === 'DE_DE') {
        this.form.controls['motherLanguage'].setValue('FA_IR');
      }
      if (v.targetLanguage === 'BETA') {
        this.showBetaLangs = true;
      } else {
        this.showBetaLangs = false;
      }
      this.settings.merge(this.form.value);
    });
  }

  ionViewDidLoad() {
    this.initalizeBackButtonCustomHandler();
    // Build an empty form for the template to render
    // this.form = this.formBuilder.group({});
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render
    // this.form = this.formBuilder.group({});
    this.isLoading = true;
    this.page = this.navParams.get('page') || this.page;
    this.pageTitleKey = this.navParams.get('pageTitleKey') || this.pageTitleKey;

    this.translate.get(this.pageTitleKey).subscribe((res) => {
      this.pageTitle = res;
    })

    this.settings.load().then(() => {
        this.api.createProfile(this.settings.allSettings).subscribe((profile: DefaultSettings) => {
          this.options.dname = profile.dname;
          this.options.motherLanguage = profile.learnDir.split('$')[0];
          this.options.targetLanguage = profile.learnDir.split('$')[1];
          this.options.difficultyLevel = profile.difficultyLevel;
          profile.profileFirstLoaded = true;
          this.settings.merge(profile).then(() => {
            this.principal.identity().then((account: Account) => {
              this.pageTitle = this.pageTitle + ' ' + account.login;
              this.settingsReady = true;
              if (this.settings.allSettings['targetLanguage'] === 'BETA') {
                this.betaLanguage = this.settings.allSettings['betaLanguage'];
                this.showBetaLangs = true;
                this.betaLanguageClicked(this.betaLanguage);
              }
              this._buildForm();
              this.isLoading = false;
            });
          });
        });
    });
  }

  ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  initalizeBackButtonCustomHandler() {
    let that = this;
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function(event) {
      that.ok();
    }, 101);  // Priorty 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file.
  }

  ok() {
    if (this.isLoading) return;
    this.isLoading = true;
    let learnDir: string;
    if (this.form.value.targetLanguage === 'BETA')
      learnDir = this.form.value.motherLanguage + '$' + this.betaLanguage;
    else
      learnDir = this.form.value.motherLanguage + '$' + this.form.value.targetLanguage;
    this.settings.setValue('learnDir',learnDir).then(() => {
      this.api.updateProfile(this.settings.allSettings).subscribe(() => {
        this.settings.switchLearnLevelTo(learnDir, this.settings.difficultyLevel).subscribe(() => {
          this.viewCtrl.dismiss();
        });
      }, (err) => {
        console.warn('Update profile failed.');
      });
    });
  }

  betaLanguageClicked(languageCode) {
    this.betaCompletedPercentageIsInProgress = true;
    this.api.completedWordPercentage(languageCode).subscribe(percentage => {
      this.betaCompletedPercentage = `${percentage} %`;
      this.betaCompletedPercentageIsInProgress = false;
    });
  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

}
