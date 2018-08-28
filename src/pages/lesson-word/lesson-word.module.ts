import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';

import { LessonWordPage } from './lesson-word';

@NgModule({
  declarations: [
    LessonWordPage
  ],
  imports: [
    IonicPageModule.forChild(LessonWordPage),
    TranslateModule.forChild(),
    NgProgressModule,
    NgProgressHttpModule
  ],
  exports: [
    LessonWordPage
  ]
})
export class LessonWordModule { }