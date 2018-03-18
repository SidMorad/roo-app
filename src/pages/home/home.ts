import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';

import { Principal } from '../../providers/auth/principal.service';
import { Api } from '../../providers/api/api';
import { Category, TranslDir, ScoreLookup, Account } from '../../models';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild('panel', { read: ElementRef}) public panel: ElementRef;
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
    // this.content.enableJsScroll();
    // this.content.resize();
  }

  ionViewWillEnter() {
    this.principal.identity().then((account) => {
      this.ngZone.run(() => {
        this.account = account === null ? {} : account;
      });
      // this.app.getRootNavs()[0].setRoot(FirstRunPage);
    });
  }

  doneLessons(category) {
    if (this.scoreLookup().categoryMap[category.uuid]) {
      return this.scoreLookup().categoryMap[category.uuid];
    }
    return 0;
  }

  scoreLookup(): ScoreLookup {
    if (this.api.cachedScoreLookup) {
      return this.api.cachedScoreLookup;
    }
    return new ScoreLookup(0, TranslDir.FA$EN_UK, {}, {});
  }

  fetchCategories() {
    this.showRetryButton = false;
    this.api.getCategoryPublicList(TranslDir.FA$EN_UK).subscribe((response) => {
      this.ngZone.run(() => {
        this.categories = response;
      });
    }, (error) => {
      this.showRetryButton = true;
    });
  }

  scrollToTheRight() {
    this.panel.nativeElement.scrollLeft += window.screen.width;
  }

  isAuthenticated() {
    return this.principal.isAuthenticated();
  }

  categoryLesson(category) {
    this.navCtrl.push('CategoryLessonPage', { category: category });
  }

  dailyLesson() {
  }

}
