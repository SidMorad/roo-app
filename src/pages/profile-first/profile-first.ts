import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Settings, Api, Principal } from '../../providers/providers';
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

  constructor(public navCtrl: NavController, public api: Api,
    public settings: Settings, public formBuilder: FormBuilder,
    public navParams: NavParams, public translate: TranslateService,
    public principal: Principal) {
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
        this.form.controls['targetLanguage'].setValue('DE_DE');
      }
      this.settings.merge(this.form.value);
    });
  }

  ionViewDidLoad() {
    // Build an empty form for the template to render
    // this.form = this.formBuilder.group({});
  }

  ionViewWillEnter() {
    // Build an empty form for the template to render
    // this.form = this.formBuilder.group({});

    this.page = this.navParams.get('page') || this.page;
    this.pageTitleKey = this.navParams.get('pageTitleKey') || this.pageTitleKey;

    this.translate.get(this.pageTitleKey).subscribe((res) => {
      this.pageTitle = res;
    })

    this.settings.load().then(() => {
      if (!this.settings.allSettings.profileFirstLoaded) {
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
              this._buildForm();
            });
          });
        });
      }
    });
  }

  ionViewWillLeave() {
    const learnDir =  this.form.value['motherLanguage'] + '$' + this.form.value['targetLanguage'];
    this.settings.setValue('learnDir',learnDir).then(() => { });
    this.settings.allSettings.learnDir = learnDir;
    this.api.updateProfile(this.settings.allSettings).subscribe(() => {
    }, (err) => {
      console.warn('Update profile failed.');
    });
    this.settings.loadCachedScoreLookups(true).subscribe();
    this.api.getCategoryPublicList(this.settings.learnDir).subscribe();
  }

  ok() {
    this.navCtrl.pop();
  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

}
