import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../app/app.constants';

@Injectable()
export class AccountService  {
    constructor(private http: HttpClient) { }

    get(): Observable<any> {
        return this.http.get(API_URL + 'roo/api/account');
    }

    getRemoteUser(): Observable<any> {
        return this.http.get(API_URL + 'roo/api/authenticate');
    }

    // save(account: any): Observable<Object> {
    //     return this.http.post(Api.API_URL + 'roo/api/account', account);
    // }
}
