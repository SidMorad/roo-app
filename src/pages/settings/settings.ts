import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { TranslateService } from '@ngx-translate/core';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Settings, Api, Principal } from '../../providers/providers';

/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  options: any;
  settingsReady = false;
  form: FormGroup;

  profileSettings = {
    page: 'profile',
    pageTitleKey: 'SETTINGS_PAGE_PROFILE'
  };
  learnSettings = {
    page: 'learn',
    pageTitleKey: 'SETTINGS_PAGE_LANGUAGE'
  };
  subSettings: any = SettingsPage;

  page: string = 'main';
  pageTitleKey: string = 'SETTINGS_TITLE';
  pageTitle: string;
  public versionNumber: string;
  private previousLearnDir: string;

  constructor(private settings: Settings,
    private formBuilder: FormBuilder, private navParams: NavParams,
    private translate: TranslateService, private api: Api,
    public principal: Principal, private appVersion: AppVersion,
    private splash: SplashScreen) {
      this.appVersion.getVersionNumber().then((versionNum) => {
        this.versionNumber = versionNum;
      }).catch((err) => { console.error('getVersionNumber ', err) });
  }

  _buildForm() {
    let group: any = {
      language: [this.options.language],
      autoPlayVoice: [this.options.autoPlayVoice],
      autoContinue: [this.options.autoContinue],
      voiceSpeedRate: [this.options.voiceSpeedRate]
    };

    switch (this.page) {
      case 'main':
        break;
      case 'profile':
        group = {
          dname: [this.options.dname],
          login: [{ value: this.options.login, disabled: true }]
        };
        break;
      case 'learn':
        group = {
          motherLanguage: [this.options.motherLanguage],
          targetLanguage: [this.options.targetLanguage],
          difficultyLevel: [this.options.difficultyLevel]
        };
        break;
    }
    this.form = this.formBuilder.group(group);

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      if (v.motherLanguage === 'EN_GB' && v.targetLanguage === 'EN_GB') {
        this.form.controls['targetLanguage'].setValue('DE_DE');
      }
      this.settings.merge(this.form.value);
      if (this.settings.allSettings.language !== this.translate.currentLang) {
        this.translate.use(this.settings.allSettings.language);
        this.splash.show();
        this.updateProfile().subscribe(() => {
          window.location.reload();
        }, (err) => {
          this.splash.hide();
          console.warn('FAILURE:settings#_buildForm#updateProfile');
        });
      }
    });
  }

  ionViewDidLoad() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});

    this.page = this.navParams.get('page') || this.page;
    this.pageTitleKey = this.navParams.get('pageTitleKey') || this.pageTitleKey;

    this.translate.get(this.pageTitleKey).subscribe((res) => {
      this.pageTitle = res;
    })

    this.settings.load().then(() => {
      this.principal.identity().then((account) => {
        this.settingsReady = true;
        this.options = this.settings.allSettings;
        this.previousLearnDir = this.settings.allSettings.learnDir;
        if (account) {
          this.options.login = account.login;
        }
        this._buildForm();
      });
    });
  }

  ionViewWillLeave() {
    console.log('SettingsPage#ionViewWillLeave');
    this.updateProfile().subscribe();
    if (this.page === 'learn') {
      console.log('Learn settings is going to be updated.');
      this.api.loadCachedScoreLookups(true).subscribe();
      if (this.previousLearnDir !== this.settings.allSettings.learnDir) {
        this.splash.show();
        window.location.reload();
      }
    }
  }

  updateProfile() {
    const learnDir = this.settings.allSettings.motherLanguage + '$' + this.settings.allSettings.targetLanguage;
    this.settings.setValue('learnDir', learnDir).then(() => { });
    this.settings.allSettings.learnDir = learnDir;  // in case above line is not fast enougth
    console.log('learnDir is going to be updated to: ', this.settings.allSettings.learnDir);
    return this.api.updateProfile(this.settings.allSettings);
  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

}
