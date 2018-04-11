import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SwingModule } from 'angular2-swing';

import { LessonQuestionPage } from './lesson-question';
import { LongPressDirective } from '../../providers';

@NgModule({
  declarations: [
    LessonQuestionPage,
    LongPressDirective
  ],
  imports: [
    IonicPageModule.forChild(LessonQuestionPage),
    TranslateModule.forChild(),
    SwingModule
  ],
  exports: [
    LessonQuestionPage
  ]
})
export class LessonQuestionModule { }