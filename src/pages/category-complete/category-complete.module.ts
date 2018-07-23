import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { CategoryCompletePage } from './category-complete';
import { PipesModule } from '../../providers/pipes/pipes.module';

@NgModule({
  declarations: [
    CategoryCompletePage
  ],
  imports: [
    IonicPageModule.forChild(CategoryCompletePage),
    TranslateModule.forChild(),
    PipesModule
  ],
  exports: [
    CategoryCompletePage
  ]
})
export class CategoryCompleteModule { }