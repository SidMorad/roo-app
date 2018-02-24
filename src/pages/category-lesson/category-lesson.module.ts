import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryLessonPage } from './category-lesson';


@NgModule({
  declarations: [
    CategoryLessonPage
  ],
  imports: [
    IonicPageModule.forChild(CategoryLessonPage),
    TranslateModule.forChild()
  ],
  exports: [
    CategoryLessonPage
  ]
})
export class CategoryLessonModule { }