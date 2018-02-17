import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { Api } from '../../../providers/api/api';

import { Category } from './category.model';

@Injectable()
export class CategoryService {
    private resourceUrl = Api.API_URL + '/roo/api/categories';

    constructor(private http: HttpClient) { }

    create(category: Category): Observable<Category> {
        return this.http.post(this.resourceUrl, category);
    }

    update(category: Category): Observable<Category> {
        return this.http.put(this.resourceUrl, category);
    }

    find(id: number): Observable<Category> {
        return this.http.get(`${this.resourceUrl}/${id}`);
    }

    query(req?: any): Observable<any> {
        return this.http.get(this.resourceUrl);
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response', responseType: 'text' });
    }
}
