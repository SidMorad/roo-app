import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { LessonFailurePage } from './lesson-failure';

@NgModule({
  declarations: [
    LessonFailurePage
  ],
  imports: [
    IonicPageModule.forChild(LessonFailurePage),
    TranslateModule.forChild()
  ],
  exports: [
    LessonFailurePage
  ]
})
export class LessonFailureModule { }