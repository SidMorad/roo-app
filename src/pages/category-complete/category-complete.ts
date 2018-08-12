
import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, Platform } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';
import { NativeAudio } from '@ionic-native/native-audio';

import { Category } from '../../models';
import { Settings } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-category-complete',
  templateUrl: 'category-complete.html'
})
export class CategoryCompletePage {

  category: Category;
  shareInProgress: boolean;

  constructor(private viewCtrl: ViewController, private navParams: NavParams,
              private socialSharing: SocialSharing, private translateService: TranslateService,
              private platform: Platform, private nativeAudio: NativeAudio,
              private settings: Settings) {
    this.category = this.navParams.get('category');
    this.initTranslations();
    this.platform.ready().then(() => {
      this.nativeAudio.preloadSimple('categoryCompleted', 'assets/sounds/categoryCompleted.mp3');
    });
  }

  ionViewDidEnter() {
    if (this.settings.allSettings.soundEffects) {
      this.nativeAudio.play('categoryCompleted');
    }
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

  shareViaTelegram() {
    this.shareInProgress = true;
    const messageBody = `${this.iDidFinishXCategoryLabel}\n\nRoo @mars_roo`;
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
    const messageBody = `${this.iDidFinishXCategoryLabel}\n\nRoo @mars_roo`;
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
    const messageBody = `https://chat.whatsapp.com/7SQgQjqaHUbFWqojC7F363)\n\n${this.iDidFinishXCategoryLabel}`;
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