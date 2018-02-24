import { Component, OnInit, NgZone } from '@angular/core';
import { App, IonicPage, NavController } from 'ionic-angular';

import { Principal } from '../../providers/auth/principal.service';
import { FirstRunPage } from '../pages';
import { LoginService } from '../../providers/login/login.service';
import { CategoryService } from '../../providers/category/category.service';
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

  constructor(public navCtrl: NavController,
              private principal: Principal,
              private app: App,
              private ngZone: NgZone,
              private loginService: LoginService,
              private categoryService: CategoryService) {
    this.categories = [];
    this.mapWidth = (window.screen.height * 4.8);
  }

  ngOnInit() {
    this.principal.identity().then((account) => {
      if (account === null) {
      //   this.app.getRootNavs()[0].setRoot(FirstRunPage);
        this.ngZone.run(() => {
          this.account = {};
        });
      } else {
        console.log("Authenticated user: ", account);
        this.ngZone.run(() => {
          this.account = account;
        })
      }
    });
    this.categoryService.getCategoryPublicList(TranslDir.FA$EN_UK).subscribe((response) => {
      this.categories = response;
    }, (error) => {
      console.log("Error on getting category list, Oops we are in trouble!", error);
      this.categories = [];
    });
  }

  isAuthenticated() {
    return this.principal.isAuthenticated();
  }

  logout() {
    this.loginService.logout();
    this.app.getRootNavs()[0].setRoot(FirstRunPage);
  }

  signin() {
    this.app.getRootNavs()[0].setRoot(FirstRunPage);
  }

  categoryLesson(category) {
    console.log("Category selected: ", category);
    this.navCtrl.push('CategoryLessonPage', { category: category});
  }

  dailyLesson() {
    console.log("Daily lessson clicked");
  }

}
