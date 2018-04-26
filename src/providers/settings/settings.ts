import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Rx';

import { DefaultSettings, ScoreLookup, Category, Score } from '../../models';
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

  public cachedCategories: Category[];
  public cachedScoreLookup: ScoreLookup;

  get learnDir() {
    if (this.settings) {
      return this.settings.learnDir;
    }
  }

  get difficultyLevel() {
    return this.settings.difficultyLevel;
  }

  private storeCachedScoreLookups() {
    this.storage.set(this.scoreLookupCacheKey, JSON.stringify(this.cachedScoreLookup))
        .then(() => console.debug('Score lookups cached successfully.'))
        .catch(() => console.warn('Score lookups cache failed.'));
  }

  public loadCachedScoreLookups(force?: boolean): Observable<any> {
    if (force) {
      this.cachedScoreLookup = null;
    }
    if (this.cachedScoreLookup) {
      return Observable.of(this.cachedScoreLookup);
    }
    return new Observable((observer) => {
      this.load().then(() => {
        this.storage.get(this.scoreLookupCacheKey).then((res) => {
          if(res) {
            this.cachedScoreLookup = JSON.parse(res);
            observer.next(this.cachedScoreLookup);
            observer.complete();
          } else {
            const learnDir = this.allSettings.learnDir;
            const difLevel = this.allSettings.difficultyLevel;
            this.api.getScoreLookup(learnDir, difLevel).subscribe((res) => {
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

  private get scoreLookupCacheKey(): string {
    const learnDir = this.allSettings.learnDir;
    const difLevel = this.allSettings.difficultyLevel;
    return 'CACHED_SCORE_LOOKUP_' + learnDir + '_' + difLevel;
  }

}
