import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

import { LessonQuestionPage } from './lesson-question';


@NgModule({
  declarations: [
    LessonQuestionPage
  ],
  imports: [
    IonicPageModule.forChild(LessonQuestionPage),
    TranslateModule.forChild(),
    DragulaModule
  ],
  exports: [
    LessonQuestionPage
  ]
})
export class LessonQuestionModule { }