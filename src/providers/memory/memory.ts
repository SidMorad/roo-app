import { Injectable } from '@angular/core';

@Injectable()
export class Memory {

  private lessonDoneSuccessfully: boolean;
  private numberOfDoneLessons: number;
  private previousScoreLevel: number;

  public setLessonDoneSuccessfully(value: boolean) {
    this.lessonDoneSuccessfully = value;
  }

  public isLessonDoneSuccessfully(): boolean {
    return this.lessonDoneSuccessfully;
  }

  public setNumberOfDoneLessons(value: number) {
    this.numberOfDoneLessons = value;
  }

  public getNumberOfDoneLessons(): number {
    return this.numberOfDoneLessons;
  }

  public setPreviousScoreLevel(value: number) {
    this.previousScoreLevel;
  }

  public getPreviousScoreLevel() {
    return this.previousScoreLevel;
  }

}
