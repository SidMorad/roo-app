import { Component } from '@angular/core';
import { IonicPage, ModalController, NavParams, ToastController } from 'ionic-angular';
import { Category } from './category.model';
import { CategoryService } from './category.provider';

@IonicPage({
    segment: 'category-detail/:id'
})
@Component({
    selector: 'page-category-detail',
    templateUrl: 'category-detail.html'
})
export class CategoryDetailPage {
    category: Category;

    constructor(private modalCtrl: ModalController, public params: NavParams,
                private categoryService: CategoryService, private toastCtrl: ToastController) {
        this.category = new Category();
        this.category.id = params.get('id');
    }

    ionViewDidLoad() {
        this.categoryService.find(this.category.id).subscribe(data => this.category = data);
    }

    open(item: Category) {
        let modal = this.modalCtrl.create('CategoryDialogPage', {item: item});
        modal.onDidDismiss(category => {
            if (category) {
                this.categoryService.update(category).subscribe(data => {
                    this.category = data;
                    let toast = this.toastCtrl.create(
                        {message: 'Category updated successfully.', duration: 3000, position: 'middle'});
                    toast.present();
                }, (error) => console.error(error));
            }
        });
        modal.present();
    }
}
