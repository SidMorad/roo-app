import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { Score } from '../../models';
import { Api } from '../../providers/api/api';

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

  constructor(private viewCtrl: ViewController, private storage: Storage,
              private api: Api) {
  }

  ionViewWillEnter() {
    this.uploadScore();
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
            this.api.updateCachedScoreLookupWith(score);
            this.storage.remove('LAST_SCORE').then().catch((err) => console.log('LAST_SCORE remove failure.'));
            setTimeout(() => {
              me.inProgress = false;
              me.resolveScoreStats();
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
    this.total = this.api.cachedScoreLookup.total;
    this.progressLevelFrom = Math.floor(this.total / 100);
    this.progressLevelTo = this.progressLevelFrom + 1;
    this.progressLevelValue = Math.floor(this.total - (this.progressLevelFrom * 100));
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

}