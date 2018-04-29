import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicPage, NavParams, ViewController, Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { TranslateService } from '@ngx-translate/core';

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
  saveInProgress: boolean;
  private unregisterBackButtonAction: any;

  constructor(private settings: Settings,
    private formBuilder: FormBuilder, private navParams: NavParams,
    private translate: TranslateService, private api: Api, private platform: Platform,
    public principal: Principal, private appVersion: AppVersion,
    private viewCtrl: ViewController) {
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
        this.form.controls['motherLanguage'].setValue('FA_IR');
      }
    });
  }

  ionViewDidLoad() {
    this.initalizeBackButtonCustomHandler();
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
        if (account) {
          this.options.login = account.login;
        }
        this._buildForm();
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
    if (this.saveInProgress) return;
    this.saveInProgress = true;
    this.settings.merge(this.form.value).then(() => {
      console.log('SETTINGS#VALUES ', this.settings.allSettings);
      const learnDir = this.settings.allSettings.motherLanguage + '$' + this.settings.allSettings.targetLanguage;
      this.settings.setValue('learnDir', learnDir).then(() => {
        this.api.updateProfile(this.settings.allSettings).subscribe(() => {
          if (this.page === 'learn') {
            this.settings.switchLearnLevelTo(this.settings.learnDir, this.settings.difficultyLevel).subscribe(() => {
              this.navigateToTabs();
            });
          } else {
            if (this.settings.allSettings.language !== this.translate.currentLang) {
              this.translate.use(this.settings.allSettings.language);
              this.navigateToTabs();
            } else {
              this.viewCtrl.dismiss();
            }
          }
        });
      });
    });
  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

  navigateToTabs() {
    this.viewCtrl.dismiss();
  }

}
