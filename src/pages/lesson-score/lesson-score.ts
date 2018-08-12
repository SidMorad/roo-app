import { Component } from '@angular/core';
import { IonicPage, ViewController, Platform, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Score } from '../../models';
import { Api } from '../../providers';
import { ScoreUtil, Settings, Memory } from '../../providers';

declare const window: any;

@IonicPage()
@Component({
  selector: 'page-lesson-score',
  templateUrl: 'lesson-score.html'
})
export class LessonScorePage {

  inProgress: boolean;
  showRetry: boolean;
  score: Score = {};
  total: number;
  progressLevelFrom: number;
  progressLevelTo: number;
  progressLevelValue: number;
  progressLevelMax: number;
  topMembersLoaded: boolean;
  topMembers: any[];
  levelUpFlag: boolean;
  scoreUploadedFlag: boolean;

  constructor(private viewCtrl: ViewController, private storage: Storage, private platform: Platform,
              private api: Api, private scoreUtil: ScoreUtil, private settings: Settings,
              private memory: Memory, private navCtrl: NavController) {
  }

  ionViewDidEnter() {
    console.log('Previous score(', this.settings.cachedScoreLookup.total, ') level is ', this.scoreUtil.resolveLevelFrom(this.settings.cachedScoreLookup.total));
    this.memory.setPreviousScoreLevel(this.scoreUtil.resolveLevelFrom(this.settings.cachedScoreLookup.total));
    if (!this.scoreUploadedFlag) {
      this.uploadScore();
    }
    if (this.platform.is('android')) {
      if (this.settings.allSettings.advertismentEnabled) {
        window.adad.LoadInterstitial();
      }
    }
  }

  ionViewDidLeave() {
    if (this.platform.is('android') && !this.levelUpFlag) {
      if (this.settings.allSettings.advertismentEnabled) {
        window.adad.ShowInterstitial();
      }
    }
  }

  uploadScore() {
    this.inProgress = true;
    this.showRetry = false;
    let me = this;
    this.storage.get('LAST_SCORE').then((scoreStr) => {
      try {
        let score: Score = JSON.parse(scoreStr);
        this.score = score;
        this.resolveScoreStats();
        this.api.createScore(score).subscribe((res) => {
            this.settings.updateCachedScoreLookupWith(score);
            this.displayLevelUpPageIfNecessary();
            this.storage.remove('LAST_SCORE').then().catch((err) => console.error('LAST_SCORE remove failure.'));
            setTimeout(() => {
              me.inProgress = false;
              me.resolveScoreStats();
              me.loadTopMembers();
            }, 1000);
        }, (err) => {
          console.log('OOPS upload score failed.', err);
          this.showRetry = true;
        });
      } catch (err) {
        console.log('Oops, parsing last score failed: ', err, scoreStr);
        this.showRetry = true;
      }
    }).catch((error) => {
      this.showRetry = true;
    });
  }

  resolveScoreStats() {
    this.total = this.settings.cachedScoreLookup.total;
    this.progressLevelFrom = this.scoreUtil.resolveLevelFrom(this.total);
    this.progressLevelTo = this.progressLevelFrom + 1;
    this.progressLevelValue =  this.total - this.scoreUtil.resolveMaxScoreFrom(this.progressLevelFrom-1);
    this.progressLevelMax = this.scoreUtil.determineDivider(this.total);
    console.log(`Total ${this.total} LevelFrom ${this.progressLevelFrom} LevelTo ${this.progressLevelTo} LevelValue ${this.progressLevelValue} LevelMax ${this.progressLevelMax}`);
  }

  loadTopMembers() {
    this.topMembersLoaded = false;
    this.api.getTop3MonthMembers(this.settings.learnDir).subscribe((res) => {
      this.topMembers = res.topMembers;
      this.topMembersLoaded = true;
    });
  }

  displayLevelUpPageIfNecessary() {
    const currentLevel = this.scoreUtil.resolveLevelFrom(this.settings.cachedScoreLookup.total);
    console.log('Current score (', this.settings.cachedScoreLookup.total,') level is ', currentLevel);
    if (this.memory.getPreviousScoreLevel() < currentLevel) {
      this.levelUpFlag = true;
      this.navCtrl.push('LevelUpPage').then(() => {
        this.scoreUploadedFlag = true;
      });
    }
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

}
