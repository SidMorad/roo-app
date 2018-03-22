import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { TranslDir, Lesson, QuestionDifficulty, Score, Category, ScoreLookup } from '../../models';

/**
 * Api is a generic(and customized for Roo domain) REST Api handler.
 */
@Injectable()
export class Api {

  public static API_URL: string = 'https://mars.webebook.org/';

  constructor(public http: HttpClient) {
  }

  updateProfile(profile) {
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

  getScoreLookup(translDir: TranslDir, force?: boolean): Observable<any> {
    if (this.cachedScoreLookup && !force) {
      return Observable.of(this.cachedScoreLookup);
    }
    return Observable.create(observer => {
      this.http.get(Api.API_URL + 'roo/api/user/score/lookup/' + TranslDir[translDir]).subscribe((scoreLookup: ScoreLookup) => {
        this.cachedScoreLookup = scoreLookup;
        observer.next(this.cachedScoreLookup);
        observer.complete();
      });
    });
  }

  getCategoryPublicList(translDir: TranslDir): Observable<any> {
    if (this.cachedCategories) {
      return Observable.of(this.cachedCategories);
    }
    return Observable.create(observer => {
      this.http.get(Api.API_URL + 'roo/api/public/categories/' + TranslDir[translDir]).subscribe((categories: Category[]) => {
        this.cachedCategories = categories;
        observer.next(this.cachedCategories);
        observer.complete();
      });
    });
  }

  getLessonPublicList(translDir: TranslDir, uuid: string): Observable<any> {
    return this.get('roo/api/public/lessons/' + TranslDir[translDir] + '/' + uuid);
  }

  getQuestions(lesson: Lesson): Observable<any> {
    return this.get('roo/api/public/questions/'
                                + lesson.translDir + '/'
                                + QuestionDifficulty[QuestionDifficulty.Beginner] + '/'
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
    }
  }

  cachedCategories: Category[];
  cachedScoreLookup: ScoreLookup;

}
