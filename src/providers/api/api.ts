import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

import { Score, DefaultSettings, Category, CommWordCommand, TranslateCommand } from '../../models';
import { API_URL, TRANSLATE_URL } from '../../app/app.constants';

/**
 * Api is a generic(and customized for Roo domain) REST Api handler.
 */
@Injectable()
export class Api {

  constructor(private http: HttpClient) {
  }

  startPayUrl(subscribeModel) {
    return this.post('roo/api/user/zarinpal/payment/token', subscribeModel, { responseType: 'text' });
  }

  subscribeWithCafebazaar(subscribeModel) {
    return this.post('roo/api/user/cafebazaar/subscribe', subscribeModel);
  }

  subscribeWithAvvalMarket(subscribeModel) {
    return this.post('roo/api/user/xmarket/subscribe/avvalmarket', subscribeModel);
  }

  subscribeWith(subscribeModel, market) {
    return this.post(`roo/api/user/xmarket/subscribe/${market}`, subscribeModel);
  }

  createProfile(profile: DefaultSettings): Observable<any> {
    return this.post('roo/api/user/profile/create', profile);
  }

  updateProfile(profile: DefaultSettings): Observable<any> {
    return this.post('roo/api/user/profile/update', profile);
  }

  getDailyLesson(): Observable<any> {
    return this.get('roo/api/user/lesson/daily');
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

  getTop3MonthMembers(learnDir: string): Observable<any> {
    return this.get(`roo/api/user/score/top3/month/${learnDir}`);
  }

  getTop3EverMembers(learnDir: string): Observable<any> {
    return this.get(`roo/api/user/score/top3/ever/${learnDir}`);
  }

  getScoreLookup(learnDir: string, difLevel: string): Observable<any> {
    return this.http.get(`${API_URL}roo/api/user/score/lookup/${learnDir}/${difLevel}`);
  }

  getLessonPublicList(difficultyLevel: string, uuid: string): Observable<any> {
    return this.get(`roo/api/public/lessons/${difficultyLevel}/${uuid}`);
  }

  searchLesson(difficultyLevel: string, params?: any): Observable<any> {
    return this.get(`roo/api/public/lesson/search/${difficultyLevel}`, params, { observe: 'response' });
  }

  getWords(lessonUuid: string, learnDir: string): Observable<any> {
    return this.get(`roo/api/public/words/${learnDir}/${lessonUuid}`);
  }

  completedWordPercentage(languageCode: string): Observable<any> {
    return this.get(`roo/api/public/words/${languageCode}/percentage`);
  }

  createScore(score: Score): Observable<any> {
    return this.post('roo/api/user/score/create', score);
  }

  createCommWord(cmd: CommWordCommand) {
    return this.post('roo/api/user/comm-words', cmd);
  }

  updateCommWord(cmd: CommWordCommand) {
    return this.put('roo/api/user/comm-words', cmd);
  }

  deleteCommWord(commWordUuid: string) {
    return this.delete(`roo/api/user/comm-words/${commWordUuid}`);
  }

  translateWithGoogleTranslate(translateCommnd: TranslateCommand) {
    // return this.post(`roo/api/user/translate`, translateCommnd);
    return this.http.post(`${TRANSLATE_URL}translate`, translateCommnd);
  }

  get(endpoint: string, params?: any, reqOpts?: any) {
    let options: HttpParams = new HttpParams();
    if (!reqOpts) {
      reqOpts = {
        params: options
      };
    }

    // Support easy query params for GET requests
    if (params) {
      for (let k in params) {
        options = options.set(k, params[k]);
      };
      reqOpts.params = options;
    }
    return this.http.get(API_URL + endpoint, reqOpts);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(API_URL + endpoint, body, reqOpts);
  }

  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(API_URL + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(API_URL + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(API_URL + endpoint, body, reqOpts);
  }

  cachedCategories: Category[];
  getCategoryPublicList(learnDir: string, force?: boolean): Observable<any> {
    if (this.cachedCategories && force !== true) return Observable.of(this.cachedCategories);
    return new Observable((observer) => {
      this.http.get(`${API_URL}roo/api/public/categories/${learnDir}`).subscribe((res: Category[]) => {
        this.cachedCategories = res;
        observer.next(this.cachedCategories);
        observer.complete();
      }, (err) => {
        observer.error(err);
        observer.complete();
      });
    });
  }

}
