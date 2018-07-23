
import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';

import { Category } from '../../models';

@IonicPage()
@Component({
  selector: 'page-category-complete',
  templateUrl: 'category-complete.html'
})
export class CategoryCompletePage {

  category: Category;
  shareInProgress: boolean;

  constructor(private viewCtrl: ViewController, private navParams: NavParams,
              private socialSharing: SocialSharing, private translateService: TranslateService) {
    this.category = this.navParams.get('category');
    this.initTranslations();
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

  shareViaTelegram() {
    this.shareInProgress = true;
    const messageBody = `${this.iDidFinishXCategoryLabel}\n\n[Roo](@mars_roo)`;
    this.socialSharing.shareVia('telegram',
      messageBody, '', this.categoryImage
    ).then(() => {
      this.shareInProgress = false;
    }).catch(error => {
      this.shareInProgress = false;
      console.error('Error on share via Telegram: ', error);
    });
  }

  shareViaInstagram() {
    this.shareInProgress = true;
    const messageBody = `${this.iDidFinishXCategoryLabel}\n\n[Roo](@mars_roo)`;
    this.socialSharing.shareViaInstagram(messageBody, null)
    .then(() => {
      this.shareInProgress = false;
    }).catch(error => {
      this.shareInProgress = false;
      console.error('Error on share via Instagram: ', error);
    });
  }

  shareViaWhatsApp() {
    this.shareInProgress = true;
    const messageBody = `${this.iDidFinishXCategoryLabel}\n\n[Roo Download](https://mars.webebook.org)\n[Roo Support](https://wa.me/989107891398)`;
    this.socialSharing.shareViaWhatsApp(messageBody, this.categoryImage, null)
    .then(() => {
      this.shareInProgress = false;
    }).catch(error => {
      this.shareInProgress = false;
      console.error('Error on share via WhatsApp: ', error);
    });
  }

  get categoryImage(): string {
    const cat = new Category(null, null, null, this.category.indexOrder, null, null, null);
    return cat.imageUrl;
  }

  get categoryImageUrl(): string {
    return `url('${this.categoryImage}')`;
  }

  iDidFinishXCategoryLabel: string;

  initTranslations() {
    this.translateService.get('I_DID_FINISH_X_CATEGORY', { categoryTitle: this.category.title }).subscribe(translated => {
      this.iDidFinishXCategoryLabel = translated;
    });
  }

}