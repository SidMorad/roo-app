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
        logglyKey: '91fc3c09-faae-4bb7-bc8c-341090d8d593',
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
