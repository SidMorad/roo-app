import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { LevelUpPage } from './level-up';
import { PipesModule } from '../../providers/pipes/pipes.module';

@NgModule({
  declarations: [
    LevelUpPage
  ],
  imports: [
    IonicPageModule.forChild(LevelUpPage),
    TranslateModule.forChild(),
    PipesModule
  ],
  exports: [
    LevelUpPage
  ]
})
export class LevelUpModule { }