import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';


import { LessonSearchPage } from './lesson-search';

@NgModule({
  declarations: [
    LessonSearchPage
  ],
  imports: [
    IonicPageModule.forChild(LessonSearchPage),
    TranslateModule.forChild(),
    NgProgressModule,
    NgProgressHttpModule
  ],
  exports: [
    LessonSearchPage
  ]
})
export class LessonSearchModule { }