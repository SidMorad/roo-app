import {Injectable, isDevMode } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { IonicErrorHandler } from 'ionic-angular';
import { LogglyService } from 'ngx-loggly-logger';

@Injectable()
export class RooErrorHandler extends IonicErrorHandler {

  constructor(private logglyService: LogglyService) {
    super();
    if (!isDevMode()) {
      logglyService.push({
        logglyKey: 'f3f529be-5a1b-4d86-94d6-b4b84fe3177b',
        sendConsoleErrors: true,
        tag: 'roo-app'
      });
    }
  }

  handleError(error) {
    if (!isDevMode()) {
      const date = new Date().toISOString();
      if (error instanceof HttpErrorResponse) {
        this.logglyService.push(`${date}, 'There was an HTTP error.': ${error.message}, 'Status code:', ${(<HttpErrorResponse>error).status}`);
      } else if (error instanceof TypeError) {
        this.logglyService.push(`${date}, 'There was a Type error.': ${error.message}`);
      } else if (error instanceof Error) {
        this.logglyService.push(`${date}, 'There was a general error.': ${error}`);
      } else {
        this.logglyService.push(`${date}, 'Nobody threw an Error but something happened!': ${error}`);
      }
    }
    else {
      super.handleError(error);
    }
  }

}
