import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { Lesson, Score, DefaultSettings, Category } from '../../models';

/**
 * Api is a generic(and customized for Roo domain) REST Api handler.
 */
@Injectable()
export class Api {
  public static API_URL: string = 'https://mars.webebook.org/';
  // public static API_URL: string = 'http://192.168.10.106:8080/';

  constructor(private http: HttpClient) {
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

  getLast7DaysScores(learnDir: string): Observable<any> {
    return this.get(`roo/api/user/score/last7/${learnDir}`);
  }

  getScoreLookup(learnDir: string, difLevel: string): Observable<any> {
    return this.http.get(`${Api.API_URL}roo/api/user/score/lookup/${learnDir}/${difLevel}`);
  }

  getLessonPublicList(difficultyLevel: string, uuid: string): Observable<any> {
    return this.get(`roo/api/public/lessons/${difficultyLevel}/${uuid}`);
  }

  getQuestions(lesson: Lesson, learnDir: string, difLevel: string): Observable<any> {
    return this.get(`roo/api/public/questions/${learnDir}/${difLevel}/${lesson.uuid}`);
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

  cachedCategories: Category[];
  getCategoryPublicList(learnDir: string, force?: boolean): Observable<any> {
    if (this.cachedCategories && force !== true) return Observable.of(this.cachedCategories);
    return new Observable((observer) => {
      this.http.get(`${Api.API_URL}roo/api/public/categories/${learnDir}`).subscribe((res: Category[]) => {
        this.cachedCategories = res;
        observer.next(this.cachedCategories);
        observer.complete();
      });
    });
  }

}
