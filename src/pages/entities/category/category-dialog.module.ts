import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoryDialogPage } from './category-dialog';
import { CategoryService } from './category.provider';

@NgModule({
    declarations: [
        CategoryDialogPage
    ],
    imports: [
        IonicPageModule.forChild(CategoryDialogPage),
        TranslateModule.forChild()
    ],
    exports: [
        CategoryDialogPage
    ],
    providers: [
        CategoryService
    ]
})
export class CategoryDialogPageModule {
}
