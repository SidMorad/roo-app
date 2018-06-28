import { Injectable, Injector } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor, HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from '../';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private injector: Injector) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const securityService = this.injector.get(SecurityService);
        if (securityService.oidc().hasValidAccessToken()) {
            request = request.clone({
                setHeaders: {
                    Authorization: securityService.oidc().authorizationHeader()
                }
            })
        }

        return next.handle(request).do((event: any) => {
            if (event instanceof HttpResponse) {
                return event;
            }
        });
    }
}
