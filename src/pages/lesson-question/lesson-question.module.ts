import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LessonQuestionPage } from './lesson-question';


@NgModule({
  declarations: [
    LessonQuestionPage
  ],
  imports: [
    IonicPageModule.forChild(LessonQuestionPage),
    TranslateModule.forChild()
  ],
  exports: [
    LessonQuestionPage
  ]
})
export class LessonQuestionModule { }