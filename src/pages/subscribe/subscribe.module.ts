import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

import { SubscribePage } from './subscribe';

@NgModule({
  declarations: [
    SubscribePage,
  ],
  imports: [
    IonicPageModule.forChild(SubscribePage),
    TranslateModule.forChild()
  ],
  exports: [
    SubscribePage
  ]
})
export class SubscribePageModule { }
