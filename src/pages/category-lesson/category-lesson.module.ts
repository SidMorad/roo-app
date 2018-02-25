import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressHttpModule } from '@ngx-progressbar/http';

import { CategoryLessonPage } from './category-lesson';


@NgModule({
  declarations: [
    CategoryLessonPage
  ],
  imports: [
    IonicPageModule.forChild(CategoryLessonPage),
    TranslateModule.forChild(),
    NgProgressModule,
    NgProgressHttpModule
  ],
  exports: [
    CategoryLessonPage
  ]
})
export class CategoryLessonModule { }