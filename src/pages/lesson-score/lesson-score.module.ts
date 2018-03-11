import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { LessonScorePage } from './lesson-score';

@NgModule({
  declarations: [
    LessonScorePage
  ],
  imports: [
    IonicPageModule.forChild(LessonScorePage),
    TranslateModule.forChild()
  ],
  exports: [
    LessonScorePage
  ]
})
export class LessonScoreModule { }