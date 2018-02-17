import { BaseEntity } from './../../../models';

export class Category implements BaseEntity {
    constructor(
        public id?: number,
        public uuid?: string,
        public titleEng?: string,
        public indexOrder?: number,
        public forSell?: boolean,
        public commingSoon?: boolean,
        public cameNew?: boolean,
        public pictureContentType?: string,
        public picture?: any,
    ) {
        this.forSell = false;
        this.commingSoon = false;
        this.cameNew = false;
    }
}
