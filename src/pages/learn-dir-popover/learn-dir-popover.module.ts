import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { LearnDirPopover } from './learn-dir-popover';

@NgModule({
  declarations: [
    LearnDirPopover
  ],
  imports: [
    IonicPageModule.forChild(LearnDirPopover),
    TranslateModule.forChild()
  ],
  exports: [
    LearnDirPopover
  ]
})
export class LearnDirPopoverModule { }
