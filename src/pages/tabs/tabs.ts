import { Component, OnInit, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Rx';

import { Tab1Root } from '../pages';
import { Tab2Root } from '../pages';
import { Tab3Root } from '../pages';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  tab1Root: any = Tab1Root;
  tab2Root: any = Tab2Root;
  tab3Root: any = Tab3Root;

  tab1Title = " ";
  tab2Title = " ";
  tab3Title = " ";

  langChangeSubscription: Subscription;

  constructor(public navCtrl: NavController, public translateService: TranslateService,
              private ngZone: NgZone) {
  }

  ngOnInit() {
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((data) => {
      console.log('Tabs#onLangChange', data);
      this.initTranslations();
    });
  }

  ionViewWillEnter() {
    this.initTranslations();
  }

  initTranslations() {
    this.translateService.get(['TAB1_TITLE', 'TAB2_TITLE', 'TAB3_TITLE']).subscribe(values => {
      this.ngZone.run(() => {
        this.tab1Title = values.TAB1_TITLE;
        this.tab2Title = values.TAB2_TITLE;
        this.tab3Title = values.TAB3_TITLE;
      })
    });
  }

  ngDestroy() {
    console.log('Tabs#ngDestroy');
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

}
