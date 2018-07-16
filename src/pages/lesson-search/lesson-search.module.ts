import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { LessonSearchPage } from './lesson-search';

@NgModule({
  declarations: [
    LessonSearchPage
  ],
  imports: [
    IonicPageModule.forChild(LessonSearchPage),
    TranslateModule.forChild()
  ],
  exports: [
    LessonSearchPage
  ]
})
export class LessonSearchModule { }