import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { TranslDir, Lesson, QuestionDifficulty, Score } from '../../models';

/**
 * Api is a generic(and customized for Roo domain) REST Api handler.
 */
@Injectable()
export class Api {
  public static API_URL: string = 'https://mars.webebook.org/';

  constructor(public http: HttpClient) {
  }

  getCategoryPublicList(translDir: TranslDir): Observable<any> {
    return this.get('roo/api/public/categories/' + TranslDir[translDir]);
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
}
