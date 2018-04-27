import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, ViewController, NavController } from 'ionic-angular';

import { Settings, ScoreUtil } from '../../providers';

@IonicPage()
@Component({
  selector: 'learn-dir-popover',
  template: `
  <ion-list>
  <ion-item-sliding *ngFor="let learn of learnDirList">
    <ion-item (click)="switchTo(learn)">
      <ion-avatar item-start>
        <span class="flag-icon flag-icon-{{learn.flagl}}"></span>
      </ion-avatar>
      <h2>{{learn.translKey | translate}}
        <ion-spinner *ngIf="isSwitching && learn.wantToSwitch"></ion-spinner>
      </h2>
      <p>{{learn.level}}</p>
      <ion-icon [name]="learn.difIcon" [isActive]="learn.key === currentKey" item-end></ion-icon>
    </ion-item>
    <ion-item-options>
      <button ion-button color="danger" (click)="delete(learn)" [disabled]="learn.key === currentKey">
        <ion-icon name="trash"></ion-icon>
      </button>
    </ion-item-options>
  </ion-item-sliding>
  </ion-list>`
})
export class LearnDirPopover implements OnInit {

  learnDirList: Array<any> = [];
  isSwitching: boolean = false;

  constructor(private settings: Settings, private scoreUtil: ScoreUtil,
              private ngZone: NgZone, private viewCtrl: ViewController,
              private navCtrl: NavController) {
  }

  ngOnInit() {
    this.loadLearnDirList();
  }

  loadLearnDirList() {
    this.ngZone.run(() => {
    this.settings.learnDirList().subscribe((list: any[]) => {
      this.learnDirList = [];
      list.forEach((row) => {
        const learnDir = row.value.learnDir;
        const mother = learnDir.split('$')[0];
        const target = learnDir.split('$')[1];
        const motherLang = mother.split('_')[0];
        const targetFlag = target.split('_')[1];
        const level = this.scoreUtil.resolveLevelFrom(row.value.total);
        let difIcon = row.value.difficultyLevel === 'Beginner' ? 'ios-text' : row.value.difficultyLevel === 'Intermediate' ? 'ios-chatbubbles' : 'ios-chatboxes';
        difIcon = row.key === this.currentKey ? difIcon : difIcon + '-outline';
        this.learnDirList.push({
            flag: targetFlag, translKey: `LANG_${targetFlag}_${motherLang}`,
            key: row.key, level: level, learnDir: learnDir, difLevel: row.value.difficultyLevel,
            flagl: targetFlag.toLowerCase(), difIcon: difIcon });
      });
    });
    });
  }

  switchTo(ll) {
    if (ll.key !== this.currentKey) {
      ll.wantToSwitch = true;
      this.isSwitching = true;
      this.settings.switchLearnLevelTo(ll.learnDir, ll.difLevel).subscribe(() => {
        this.navCtrl.push('TabsPage').then(() => {
          const index = this.navCtrl.getActive().index;
          this.navCtrl.remove(0, index);
        });
      });
    } else {
      this.viewCtrl.dismiss();
    }
  }

  delete(ll) {
    ll.wantToSwitch = true;
    this.isSwitching = true;
    this.settings.removeByKey(ll.key).then(() => {
      this.loadLearnDirList();
      this.isSwitching = false;
    });
  }

  get currentKey(): string {
    return this.settings.scoreLookupCacheKey;
  }

}
