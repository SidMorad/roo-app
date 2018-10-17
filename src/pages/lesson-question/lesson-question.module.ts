import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { SwingModule } from 'angular2-swing';

import { LessonQuestionPage } from './lesson-question';
import { LongPressDirective } from '../../providers';
import { PipesModule } from '../../providers/pipes/pipes.module';

@NgModule({
  declarations: [
    LessonQuestionPage,
    LongPressDirective
  ],
  imports: [
    IonicPageModule.forChild(LessonQuestionPage),
    TranslateModule.forChild(),
    SwingModule,
    PipesModule
  ],
  exports: [
    LessonQuestionPage
  ]
})
export class LessonQuestionModule { }