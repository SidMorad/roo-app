import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';

import { Lesson, Score, Category, ScoreLookup, DefaultSettings } from '../../models';
import { Settings } from '../../providers';

/**
 * Api is a generic(and customized for Roo domain) REST Api handler.
 */
@Injectable()
export class Api {
  public static API_URL: string = 'https://mars.webebook.org/';
  // public static API_URL: string = 'http://192.168.10.106:8080/';
  public cachedCategories: Category[];
  public cachedScoreLookup: ScoreLookup;

  constructor(private http: HttpClient, private storage: Storage,
              private settings: Settings) {
    this.loadCachedScoreLookups();
  }

  startPayUrl(subscribeModel) {
    return this.post('roo/api/user/zarinpal/payment/token', subscribeModel, { responseType: 'text' });
  }

  createProfile(profile: DefaultSettings): Observable<any> {
    return this.post('roo/api/user/profile/create', profile);
  }

  updateProfile(profile: DefaultSettings): Observable<any> {
    return this.post('roo/api/user/profile/update', profile);
  }

  getProfile(): Observable<any> {
    return this.get('roo/api/user/profile/get');
  }

  versionCode(): Observable<any> {
    return this.get('roo/api/public/build/versionCode');
  }

  getLast7DaysScores(): Observable<any> {
    return this.get('roo/api/user/score/last7/FA$EN_UK');
  }

  private getScoreLookup(force?: boolean): Observable<any> {
    if (force) {
      this.cachedScoreLookup = null;
    }
    if (this.cachedScoreLookup) {
      return Observable.of(this.cachedScoreLookup);
    }
    const learnDir = this.settings.allSettings.learnDir;
    const difLevel = this.settings.allSettings.difficultyLevel;
    return Observable.create(observer => {
      this.http.get(`${Api.API_URL}roo/api/user/score/lookup/${learnDir}/${difLevel}`).subscribe((scoreLookup: ScoreLookup) => {
        this.cachedScoreLookup = scoreLookup;
        this.storeCachedScoreLookups();
        observer.next(this.cachedScoreLookup);
        observer.complete();
      });
    });
  }

  getCategoryPublicList(force?: boolean): Observable<any> {
    if (force) {
      this.cachedCategories = null;
    }
    if (this.cachedCategories) {
      return Observable.of(this.cachedCategories);
    }
    return Observable.create(observer => {
      this.http.get(Api.API_URL + 'roo/api/public/categories/' + this.settings.allSettings.learnDir).subscribe((categories: Category[]) => {
        this.cachedCategories = categories;
        observer.next(this.cachedCategories);
        observer.complete();
      });
    });
  }

  getLessonPublicList(difficultyLevel: string, uuid: string): Observable<any> {
    return this.get('roo/api/public/lessons/' + difficultyLevel + '/' + uuid);
  }

  getQuestions(lesson: Lesson): Observable<any> {
    return this.get('roo/api/public/questions/'
                                + this.settings.allSettings.learnDir + '/'
                                + this.settings.allSettings.difficultyLevel + '/'
                                + lesson.uuid);
  }

  createScore(score: Score): Observable<any> {
    return this.post('roo/api/user/score/create', score);
  }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(Api.API_URL + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(Api.API_URL + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(Api.API_URL + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(Api.API_URL + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(Api.API_URL + endpoint, body, reqOpts);
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
      this.settings.load().then(() => {
        this.storage.get(this.scoreLookupCacheKey).then((res) => {
          if(res) {
            this.cachedScoreLookup = JSON.parse(res);
            observer.next(this.cachedScoreLookup);
            observer.complete();
          } else {
            this.getScoreLookup(force).subscribe((res) => {
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

  private get scoreLookupCacheKey(): string {
    const learnDir = this.settings.allSettings.learnDir;
    const difLevel = this.settings.allSettings.difficultyLevel;
    return 'CACHED_SCORE_LOOKUP_' + learnDir + '_' + difLevel;
  }

}
