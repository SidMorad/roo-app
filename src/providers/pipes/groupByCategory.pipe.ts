import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupByCategory' })
export class GroupByCategoryPipe implements PipeTransform {
  dividers = {};

  transform(list: any): any[] {
    if (!list || !list.length) return;

    let output = [],
        previousCat,
        currentCat;

    for (let i = 0, ii = list.length; i < ii; i++) {
      let item = list[i];
      currentCat = item.cUuid;
      if (!previousCat || currentCat != previousCat) {
        let dividerId = currentCat;
        if (!this.dividers[dividerId]) {
          this.dividers[dividerId] = {
            uuid: currentCat,
            isDivider: true,
            title: item.cTitle,
            index: item.cIndex
          };
        }

        output.push(this.dividers[dividerId]);
      }

      output.push(item);
      previousCat = currentCat;
    }

    return output;
  }
}
