import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Settings, Api, Principal } from '../../providers/providers';
import { ProfileFirst, Account } from '../../models';

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
      login: [{ value: this.options.login, disabled: true }]
    };

    this.form = this.formBuilder.group(group);

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.settings.merge(this.form.value);
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
      this.api.getProfile().subscribe((profile: ProfileFirst) => {
        this.options.dname = profile.dname;
        if (!this.settings.allSettings.profileFirstLoaded) {
          const p: any = profile;
          p.profileFirstLoaded = true;
          this.settings.merge(p);
        }
        this.principal.identity().then((account: Account) => {
          this.settingsReady = true;
          this.options.login = account.login;
          this._buildForm();
        });
      });
    });
  }

  ionViewWillLeave() {
    this.api.updateProfile(this.settings.allSettings).subscribe(() => {
      console.log('Profile updated succesfully');
    });
  }

  ok() {
    this.navCtrl.pop();
  }

  ngOnChanges() {
    console.log('Ng All Changes');
  }

}
