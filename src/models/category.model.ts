import { IMAGE_ORIGIN } from '../app/app.constants';

export class Category {
  constructor(
    public uuid?: string,
    public title?: string,
    public nol?: number,
    public indexOrder?: number,
    public forSell?: boolean,
    public cameNew?: boolean,
    public commingSoon?: boolean
  ) {
    this.forSell = false;
    this.cameNew = false;
    this.commingSoon = false;
  }

  get imageUrl(): string {
    return `${IMAGE_ORIGIN}categories/category-${this.indexOrder}.jpeg`;
  }

}