import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';

import { Principal } from '../../providers/auth/principal.service';
import { Api } from '../../providers/api/api';
import { Category, TranslDir } from '../../models';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  account: Account = {};
  categories: Category[];
  mapWidth: number;
  showRetryButton: boolean;

  constructor(private navCtrl: NavController,
              private principal: Principal,
              private ngZone: NgZone,
              private api: Api,
              public platform: Platform) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 4.8);
  }

  ngOnInit() {
    console.log('Home initalized. ', new Date());
    this.fetchCategories();
  }

  ionViewWillEnter() {
    this.principal.identity().then((account) => {
      console.log("Authenticated user: ", account, new Date());
      this.ngZone.run(() => {
        this.account = account === null ? {} : account;
      });
      // this.app.getRootNavs()[0].setRoot(FirstRunPage);
    });
  }

  fetchCategories() {
    this.showRetryButton = false;
    this.api.getCategoryPublicList(TranslDir.FA$EN_UK).subscribe((response) => {
      this.ngZone.run(() => {
        this.categories = response;
      });
    }, (error) => {
      console.log("Error on getting category list, Oops we are in trouble!", error);
      this.showRetryButton = true;
    });
  }

  isAuthenticated() {
    return this.principal.isAuthenticated();
  }

  categoryLesson(category) {
    this.navCtrl.push('CategoryLessonPage', { category: category});
  }

  dailyLesson() {
    console.log("Daily lessson clicked");
  }

}
