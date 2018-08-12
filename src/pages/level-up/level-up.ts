
import { Component } from '@angular/core';
import { IonicPage, ViewController, Platform } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateService } from '@ngx-translate/core';
import { NativeAudio } from '@ionic-native/native-audio';

import { ScoreUtil, Settings } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-level-up',
  templateUrl: 'level-up.html'
})
export class LevelUpPage {

  toLevel: number;
  totalScore: number;
  shareInProgress: boolean;

  constructor(private viewCtrl: ViewController, private translateService: TranslateService,
              private socialSharing: SocialSharing, private platform: Platform,
              private scoreUtil: ScoreUtil, private settings: Settings,
              private nativeAudio: NativeAudio) {
    this.totalScore = this.settings.cachedScoreLookup.total;
    this.toLevel = this.scoreUtil.resolveLevelFrom(this.totalScore);
    this.initTranslations();
    this.platform.ready().then(() => {
      this.nativeAudio.preloadSimple('levelUp', 'assets/sounds/categoryCompleted.mp3');
    });
  }

  ionViewDidEnter() {
    if (this.settings.allSettings.soundEffects) {
      this.nativeAudio.play('levelUp');
    }
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

  shareViaTelegram() {
    this.shareInProgress = true;
    const messageBody = `${this.messageLabel}\n\nRoo @mars_roo`;
    this.socialSharing.shareVia('telegram',
      messageBody, '', null
    ).then(() => {
      this.shareInProgress = false;
    }).catch(error => {
      this.shareInProgress = false;
      console.error('Error on share via Telegram: ', error);
    });
  }

  shareViaInstagram() {
    this.shareInProgress = true;
    const messageBody = `${this.messageLabel}\n\nRoo @mars_roo`;
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
    const messageBody = `https://chat.whatsapp.com/7SQgQjqaHUbFWqojC7F363)\n\n${this.messageLabel}`;
    this.socialSharing.shareViaWhatsApp(messageBody, null, null)
    .then(() => {
      this.shareInProgress = false;
    }).catch(error => {
      this.shareInProgress = false;
      console.error('Error on share via WhatsApp: ', error);
    });
  }

  messageLabel: string;

  initTranslations() {
    this.translateService.get('I_HAVE_JUST_REACHED_LEVEL_X_AT_ROO', { level: this.toLevel }).subscribe(translated => {
      this.messageLabel = translated;
    });
  }

}