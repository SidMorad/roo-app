import { Component, OnInit, NgZone } from '@angular/core';
import { IonicPage, ViewController, NavController } from 'ionic-angular';

import { Settings, ScoreUtil, Memory } from '../../providers';

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
          <ion-icon name="ribbon"></ion-icon>
          {{learn.level}}
        </h2>
        <ion-icon [name]="learn.difIcon" [isActive]="learn.key === currentKey" item-end></ion-icon>
      </ion-item>
      <ion-item-options>
        <button ion-button color="danger" (click)="delete(learn)" [disabled]="learn.key === currentKey">
          <ion-icon name="trash"></ion-icon>
        </button>
      </ion-item-options>
    </ion-item-sliding>
    <ion-item (click)="newDirection()">
      <ion-avatar item-start>
        <button ion-button icon-only clear color="dark">
          <ion-icon name="add-circle"></ion-icon>
        </button>
      </ion-avatar>
      <h2>{{'NEW_LABEL' | translate}}
        <ion-spinner *ngIf="isLeaving"></ion-spinner>
      </h2>
    </ion-item>
  </ion-list>`
})
export class LearnDirPopover implements OnInit {

  learnDirList: Array<any> = [];
  isSwitching: boolean = false;
  isLeaving: boolean = false;

  constructor(private settings: Settings, private scoreUtil: ScoreUtil,
              private ngZone: NgZone, private viewCtrl: ViewController,
              private navCtrl: NavController, private memory: Memory) {
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
        const target = learnDir.split('$')[1];
        const targetFlag = target.split('_')[1];
        const translateKey = this.memory.translateKeyFor(target);
        const level = this.scoreUtil.resolveLevelFrom(row.value.total);
        let difIcon = row.value.difficultyLevel === 'Beginner' ? 'ios-text' : row.value.difficultyLevel === 'Intermediate' ? 'ios-chatbubbles' : 'ios-chatboxes';
        difIcon = row.key === this.currentKey ? difIcon : difIcon + '-outline';
        this.learnDirList.push({
            flag: targetFlag, translKey: `${translateKey}`,
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
        this.viewCtrl.dismiss();
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

  newDirection() {
    this.isLeaving = true;
    this.navCtrl.push('SettingsPage', {
      page: 'learn',
      pageTitleKey: 'SETTINGS_PAGE_LANGUAGE'
    }).then(() => {
      this.viewCtrl.dismiss();
    })
  }

  get currentKey(): string {
    return this.settings.scoreLookupCacheKey;
  }

}
