import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Rx';

import { DefaultSettings, ScoreLookup, Score } from '../../models';
import { Api } from './../';

declare var cordova: any;

/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
@Injectable()
export class Settings {
  private SETTINGS_KEY: string = '_settings';
  private settings: any;
  private _defaults: any;
  public dailyLessonPictureUrl: string;

  constructor(private storage: Storage, public defaults: DefaultSettings,
    private api: Api, private platform: Platform, private events: Events) {
    this._defaults = defaults;
    this.loadCachedScoreLookups();
    if (this.platform.is('android')) {
      this.setupLocalNotifications();
    }
  }

  load() {
    if (this.settings) {
      return Promise.resolve(this.settings);
    }
    return this.storage.get(this.SETTINGS_KEY).then((value) => {
      if (value) {
        this.settings = value;
        return this._mergeDefaults(this._defaults);
      } else {
        return this.setAll(this._defaults).then((val) => {
          this.settings = val;
        })
      }
    });
  }

  private _mergeDefaults(defaults: any) {
    for (let k in defaults) {
      if (!(k in this.settings)) {
        this.settings[k] = defaults[k];
      }
    }
    return this.setAll(this.settings);
  }

  merge(settings: any) {
    for (let k in settings) {
      this.settings[k] = settings[k];
    }
    return this.save();
  }

  setValue(key: string, value: any) {
    this.settings[key] = value;
    return this.storage.set(this.SETTINGS_KEY, this.settings);
  }

  setAll(value: any) {
    return this.storage.set(this.SETTINGS_KEY, value);
  }

  getValue(key: string) {
    return this.storage.get(this.SETTINGS_KEY)
      .then(res => {
        return res[key];
      });
  }

  save() {
    return this.setAll(this.settings);
  }

  get allSettings() {
    return this.settings;
  }

  public cachedScoreLookup: ScoreLookup;

  get learnDir() {
    return this.settings ? this.settings.learnDir : 'FA_IR$EN_GB';
  }
  get motherLang() { return this.learnDir.split('$')[0].split('_')[0]; }
  get motherFlag() { return this.learnDir.split('$')[0].split('_')[1]; }
  get targetLang() { return this.learnDir.split('$')[1].split('_')[0]; }
  get targetFlag() { return this.learnDir.split('$')[1].split('_')[1]; }

  get difficultyLevel() {
    return this.settings ? this.settings.difficultyLevel : 'Beginner';
  }

  setupLocalNotifications(quick?: boolean) {
    const delay = quick ? 0 : 60000;
    const that = this;
    setTimeout(() => {
      that.platform.ready().then(() => {
        cordova.plugins.notification.local.clearAll(function (yes) {
          that.load().then(() => {
            if (that.allSettings.notificationEnabled) {
              cordova.plugins.notification.local.hasPermission(function (yes) {
                if (yes) {
                  that.scheduleDailyNotify();
                } else {
                  cordova.plugins.notification.local.requestPermission(function (yes) {
                    that.scheduleDailyNotify();
                  });
                }
              });
            }
          });
        });
      });
    }, delay);
  }

  scheduleDailyNotify() {
    const time = this.allSettings.notificationDailyAt.split(':');
    // console.log('Notify At: ', time, +time[0], +time[1]);
    if (!isNaN(time[0]) && !isNaN(time[1])) {
      cordova.plugins.notification.local.schedule({
        id: 1, title: 'Roo', text: 'Your daily lesson is ready.',
        icon: this.dailyLessonPictureUrl,
        trigger: { every: { hour: +time[0], minute: +time[1] } }
      });
    }
  }

  switchLearnLevelTo(learnDir: string, difLevel: string) {
    return new Observable((observer) => {
      this.setValue('learnDir', learnDir).then(() => {
        this.setValue('difficultyLevel', difLevel).then(() => {
          this.api.getCategoryPublicList(learnDir, true).subscribe(() => {
            this.loadCachedScoreLookups(true).subscribe(() => {
              this.events.publish('LEARN_DIR_DIFFIC_LEVEL_SWITCH_EVENT');
              observer.next(true);
              observer.complete();
            });
          });
        });
      });
    });
  }

  private storeCachedScoreLookups() {
    this.updateLearnDirList();
    this.storage.set(this.scoreLookupCacheKey, JSON.stringify(this.cachedScoreLookup))
        .then(() => console.debug('Score lookups cached successfully.'))
        .catch(() => console.warn('Score lookups cache failed.'));
  }

  public loadCachedScoreLookups(force?: boolean): Observable<any> {
    if (this.cachedScoreLookup && force !== true) return Observable.of(this.cachedScoreLookup);
    return new Observable((observer) => {
      this.load().then(() => {
        this.storage.get(this.scoreLookupCacheKey).then((res) => {
          if(res) {
            this.cachedScoreLookup = JSON.parse(res);
            observer.next(this.cachedScoreLookup);
            observer.complete();
          } else {
            this.api.getScoreLookup(this.learnDir, this.difficultyLevel).subscribe((res) => {
              this.cachedScoreLookup = res;
              this.storeCachedScoreLookups();
              observer.next(res);
              observer.complete();
            });
          }
        }).catch((er) => {
          console.error('Error on lookup cahced scores.', er);
          observer.error(er);
          observer.complete();
        });
      });
    });
  }

  updateCachedScoreLookupWith(score: Score) {
    return new Observable(observer => {
      if (this.cachedScoreLookup) {
        this.cachedScoreLookup.total += score.score;
        if (this.cachedScoreLookup.lessonMap[score.lessonUuid] == null) {
          this.cachedScoreLookup.lessonMap[score.lessonUuid] = score.star;
          console.log('Lesson (', score.lessonUuid , ') star set to ', score.star);
          if (this.cachedScoreLookup.categoryMap[score.categoryUuid]) {
            this.cachedScoreLookup.categoryMap[score.categoryUuid] = this.cachedScoreLookup.categoryMap[score.categoryUuid] + 1;
          } else {
            this.cachedScoreLookup.categoryMap[score.categoryUuid] = 1;
          }
        } else if (this.cachedScoreLookup.lessonMap[score.lessonUuid] < score.star) {
          this.cachedScoreLookup.lessonMap[score.lessonUuid] = score.star;
        }
        this.storeCachedScoreLookups();
        observer.next(null);
        observer.complete();
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  private readonly scoreLookupCacheKeyPrefix: string = 'CACHED_SCORE_LOOKUP_';
  public get scoreLookupCacheKey(): string {
    return `${this.scoreLookupCacheKeyPrefix}${this.learnDir}_${this.difficultyLevel}`;
  }

  private readonly learnDirListKey: string = 'LEARN_DIR_LIST_KEY';
  private updateLearnDirList() {
    this.storage.get(this.learnDirListKey).then(learnDirDic => {
      if (learnDirDic) {
        learnDirDic[this.scoreLookupCacheKey] = JSON.stringify(this.cachedScoreLookup);
      } else {
        learnDirDic = {};
        learnDirDic[this.scoreLookupCacheKey] = JSON.stringify(this.cachedScoreLookup);
      }
      this.storage.set(this.learnDirListKey, learnDirDic);
    });
  }

  learnDirList() {
    return new Observable(observer => {
      this.storage.get(this.learnDirListKey).then(learnDirDic => {
        if (learnDirDic) {
          const result = Object.keys(learnDirDic).map(function(key) {
            return { key: key, value: JSON.parse(learnDirDic[key]) };
          });
          observer.next(result);
        } else {
          observer.next([]);
        }
        observer.complete();
      });
    });
  }

  deleteLearnDirFromList(key) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.storage.get(that.learnDirListKey).then(learnDirDic => {
        delete learnDirDic[key];
        that.storage.set(that.learnDirListKey, learnDirDic).then(() => {
          resolve(true);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    });
  }

  removeByKey(key) {
    if (key.indexOf(this.scoreLookupCacheKeyPrefix) !== -1) {
      const promises = [this.deleteLearnDirFromList(key), this.storage.remove(key)];
      return Promise.all(promises);
    } else {
      return this.storage.remove(key);
    }
  }

}
