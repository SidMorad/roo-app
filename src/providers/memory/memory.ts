import { Injectable } from '@angular/core';

@Injectable()
export class Memory {

  private lessonDoneSuccessfully: boolean;

  public setLessonDoneSuccessfully(value: boolean) {
    this.lessonDoneSuccessfully = value;
  }

  public isLessonDoneSuccessfully(): boolean {
    return this.lessonDoneSuccessfully;
  }

}
