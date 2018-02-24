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
}