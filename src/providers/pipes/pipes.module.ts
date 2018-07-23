import { NgModule } from '@angular/core';

import { GroupByCategoryPipe } from './groupByCategory.pipe';
import { SafePipe } from './safe.pipe';

@NgModule({
  declarations: [
    GroupByCategoryPipe,
    SafePipe
  ],
  imports: [

  ],
  exports: [
    GroupByCategoryPipe,
    SafePipe
  ]
})
export class PipesModule { }