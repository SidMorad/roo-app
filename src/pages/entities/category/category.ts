import { Component } from '@angular/core';
import { ModalController, NavController, ToastController } from 'ionic-angular';
import { Category } from './category.model';
import { CategoryService } from './category.provider';

// @IonicPage()
@Component({
    selector: 'page-category',
    templateUrl: 'category.html'
})
export class CategoryPage {
    categories: Category[];

    // todo: add pagination

    constructor(private navCtrl: NavController, private categoryService: CategoryService,
                private modalCtrl: ModalController, private toastCtrl: ToastController) {
        this.categories = [];
    }

    ionViewDidLoad() {
        this.loadAll();
    }

    loadAll(refresher?) {
        this.categoryService.query().subscribe(
            (response) => {
                this.categories = response;
                if (typeof(refresher) !== 'undefined') {
                    refresher.complete();
                }
            },
            (error) => {
                console.error(error);
                let toast = this.toastCtrl.create({message: 'Failed to load data', duration: 2000, position: 'middle'});
                toast.present();
            });
    }

    trackId(index: number, item: Category) {
        return item.id;
    }

    open(slidingItem: any, item: Category) {
        let modal = this.modalCtrl.create('CategoryDialogPage', {item: item});
        modal.onDidDismiss(category => {
            if (category) {
                if (category.id) {
                    this.categoryService.update(category).subscribe(data => {
                        this.loadAll();
                        let toast = this.toastCtrl.create(
                            {message: 'Category updated successfully.', duration: 3000, position: 'middle'});
                        toast.present();
                        slidingItem.close();
                    }, (error) => console.error(error));
                } else {
                    this.categoryService.create(category).subscribe(data => {
                        this.categories.push(data);
                        let toast = this.toastCtrl.create(
                            {message: 'Category added successfully.', duration: 3000, position: 'middle'});
                        toast.present();
                    }, (error) => console.error(error));
                }
            }
        });
        modal.present();
    }

    delete(category) {
        this.categoryService.delete(category.id).subscribe(() => {
            let toast = this.toastCtrl.create(
                {message: 'Category deleted successfully.', duration: 3000, position: 'middle'});
            toast.present();
            this.loadAll();
        }, (error) => console.error(error));
    }

    detail(category: Category) {
        this.navCtrl.push('CategoryDetailPage', {id: category.id});
    }
}
