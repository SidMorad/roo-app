import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';

import { Api } from '../api/api';
import { TranslDir } from '../../models';

@Injectable()
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategoryPublicList(translDir: TranslDir): Observable<any> {
    return this.http.get(Api.API_URL + '/roo/api/public/categories/' + TranslDir[translDir]);
  }

}