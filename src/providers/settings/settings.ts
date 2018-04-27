import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Rx';

import { DefaultSettings, ScoreLookup, Score, LearnDir, DifficultyLevel } from '../../models';
import { Api } from './../providers';

/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
@Injectable()
export class Settings {
  private SETTINGS_KEY: string = '_settings';

  settings: any;

  _defaults: any;
  _readyPromise: Promise<any>;

  constructor(private storage: Storage, public defaults: DefaultSettings, private api: Api) {
    this._defaults = defaults;
    this.loadCachedScoreLookups();
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

  get difficultyLevel() {
    return this.settings ? this.settings.difficultyLevel : 'Beginner';
  }

  switchLearnLevelTo(learnDir: string, difLevel: string) {
    return new Observable((observer) => {
      this.setValue('learnDir', learnDir).then(() => {
        this.setValue('difficultyLevel', difLevel).then(() => {
          this.api.getCategoryPublicList(learnDir, true).subscribe(() => {
            this.loadCachedScoreLookups(true).subscribe(() => {
              observer.next(true);
              observer.complete();
            });
          });
        });
      });
    });
  }

  private storeCachedScoreLookups() {
    this.storage.set(this.scoreLookupCacheKey, JSON.stringify(this.cachedScoreLookup))
        .then(() => console.debug('Score lookups cached successfully.'))
        .catch(() => console.warn('Score lookups cache failed.'));
  }

  public loadCachedScoreLookups(force?: boolean): Observable<any> {
    if (force) this.cachedScoreLookup = null;
    if (this.cachedScoreLookup) return Observable.of(this.cachedScoreLookup);
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
    if (this.cachedScoreLookup) {
      this.cachedScoreLookup.total += score.score;
      if (this.cachedScoreLookup.lessonMap[score.lessonUuid] == null) {
        this.cachedScoreLookup.lessonMap[score.lessonUuid] = score.star;
        if (this.cachedScoreLookup.categoryMap[score.categoryUuid]) {
          this.cachedScoreLookup.categoryMap[score.categoryUuid] = this.cachedScoreLookup.categoryMap[score.categoryUuid] + 1;
        } else {
          this.cachedScoreLookup.categoryMap[score.categoryUuid] = 1;
        }
      } else if (this.cachedScoreLookup.lessonMap[score.lessonUuid] < score.star) {
        this.cachedScoreLookup.lessonMap[score.lessonUuid] = score.star;
      }
      this.storeCachedScoreLookups();
    }
  }

  scoreLookupCacheKeyPrefix: string = 'CACHED_SCORE_LOOKUP_';
  public get scoreLookupCacheKey(): string {
    return `${this.scoreLookupCacheKeyPrefix}${this.learnDir}_${this.difficultyLevel}`;
  }

  learnDirList() {
    return new Observable((observer) => {
      let result = [];
      let promises = [];
      const keys = this.allPossibleScoreLookupKeys();
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let promise = this.storage.get(key).then((value) => {
          if (value) {
            result.push({ key: key, value: JSON.parse(value) });
          }
        }).catch();
        promises.push(promise);
      }
      Promise.all(promises).then(() => {
        observer.next(result);
        observer.complete();
      }).catch();
    });
  }

  removeByKey(key) {
    return this.storage.remove(key);
  }

  private allPossibleScoreLookupKeys() : any[] {
    let result = [];
    for (let learnDir in LearnDir) {
      if (isNaN(Number(learnDir))) {
        for (let dl in DifficultyLevel) {
          if (isNaN(Number(dl))) {
            result.push(this.scoreLookupCacheKeyPrefix + learnDir + '_' + dl);
          }
        }
      }
    }
    console.log('All possible keys: ', result);
    return result;
  }

}
