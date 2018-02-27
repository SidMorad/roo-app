import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-lesson-failure',
  templateUrl: 'lesson-failure.html'
})
export class LessonFailurePage {

  constructor(private viewCtrl: ViewController) {
  }

  continue() {
    this.viewCtrl.dismiss({action: 'continue'});
  }

  endLesson() {
    this.viewCtrl.dismiss({action: 'endLesson'});
  }

}