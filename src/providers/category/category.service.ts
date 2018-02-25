import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';

import { Api } from '../api/api';
import { TranslDir, Lesson, QuestionDifficulty } from '../../models';

@Injectable()
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategoryPublicList(translDir: TranslDir): Observable<any> {
    return this.http.get(Api.API_URL + '/roo/api/public/categories/' + TranslDir[translDir]);
  }

  getLessonPublicList(translDir: TranslDir, uuid: string): Observable<any> {
    return this.http.get(Api.API_URL + '/roo/api/public/lessons/' + TranslDir[translDir] + '/' + uuid);
  }

  getQuestions(lesson: Lesson): Observable<any> {
    return this.http.get(Api.API_URL + '/roo/api/public/questions/'
                                + lesson.translDir + '/'
                                + QuestionDifficulty[QuestionDifficulty.Beginner] + '/'
                                + lesson.uuid);
  }

}