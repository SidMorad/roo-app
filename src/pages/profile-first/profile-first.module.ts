import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ProfileFirstPage } from './profile-first';

@NgModule({
  declarations: [
    ProfileFirstPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileFirstPage),
    TranslateModule.forChild()
  ],
  exports: [
    ProfileFirstPage
  ]
})
export class ProfileFirstPageModule { }
