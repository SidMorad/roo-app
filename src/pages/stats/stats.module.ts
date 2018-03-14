import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { StatsPage } from './stats';

@NgModule({
  declarations: [
    StatsPage
  ],
  imports: [
    IonicPageModule.forChild(StatsPage),
    TranslateModule.forChild(),
    ChartsModule
  ],
  exports: [
    StatsPage
  ]
})
export class StatsModule { }