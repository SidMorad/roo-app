import { Injectable } from '@angular/core';

@Injectable()
export class ScoreUtil {

  constructor() { }

  between(x, min, max): boolean {
    return x >= min && x <= max;
  }

  determineDivider(total): number {
    if (this.between(total, 0, 100)) {
      return 50;
    } else if (this.between(total, 100, 500)) {
      return 100;
    } else if (this.between(total, 500, 1000)) {
      return 200;
    } else if (this.between(total, 1000, 2000)) {
      return 300;
    } else if (this.between(total, 2000, 5000)) {
      return 500;
    } else if (this.between(total, 5000, 10000)) {
      return 1000;
    } else if (this.between(total, 10000, 15000)) {
      return 2000;
    } else if (this.between(total, 15000, 50000)) {
      return 3000;
    } else if (this.between(total, 50000, 100000)) {
      return 5000;
    } else {
      return 10000;
    }
  }


  resolveLevelFrom(total): number {
    let divider = this.determineDivider(total);
    if (divider == 50) {
      return Math.floor(total / 50);
    } else if (divider == 100) {
      return 1 + Math.floor(total / 100);
    } else if (divider == 200) {
      return 4 + Math.floor(total / 200);
    } else if (divider == 300) {
      return 6 + Math.floor(total / 300);
    } else if (divider == 500) {
      return 9 + Math.floor(total / 500);
    } else if (divider == 1000) {
      return 14 + Math.floor(total / 1000);
    } else if (divider == 2000) {
      return 19 + Math.floor(total / 2000);
    } else if (divider == 3000) {
      return 21 + Math.floor(total / 3000);
    } else if (divider == 5000) {
      return 27 + Math.floor(total / 5000);
    } else if (divider == 10000) {
      return 37 + Math.floor(total / 10000);
    }
  }

}