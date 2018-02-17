import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoryDetailPage } from './category-detail';
import { CategoryService } from './category.provider';

@NgModule({
    declarations: [
        CategoryDetailPage
    ],
    imports: [
        IonicPageModule.forChild(CategoryDetailPage),
        TranslateModule.forChild()
    ],
    exports: [
        CategoryDetailPage
    ],
    providers: [CategoryService]
})
export class CategoryDetailPageModule {
}
