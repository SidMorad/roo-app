import { Injectable } from '@angular/core';

import { DifficultyLevel } from '../../models';

@Injectable()
export class QuestionGenerator {

  pictures: number[];
  subjects: number[];

  constructor() {
  }

  public generate(lessonWords, difficultyLevel: DifficultyLevel): any[] {
    switch(DifficultyLevel[difficultyLevel]) {
      case DifficultyLevel.Beginner:
        return this.generateBeginnerQuestions(lessonWords);
      case DifficultyLevel.Intermediate:
        return this.generateIntermediateQuestions(lessonWords);
      case DifficultyLevel.Advanced:
        return this.generateAdvancedQuestions(lessonWords);
    }
  }

  private generateBeginnerQuestions(lessonwords): any[] {
    this.analysis(lessonwords);
    return this.generateBeginner(this.pictures, this.subjects, lessonwords);
  }

  private generateIntermediateQuestions(lessonwords): any[] {
    this.analysis(lessonwords);
    return this.generateIntermediate(this.pictures, this.subjects, lessonwords);
  }

  private generateAdvancedQuestions(lessonwords): any[] {
    this.analysis(lessonwords);
    return this.generateAdvanced(this.pictures, this.subjects, lessonwords);
  }

  private analysis(data) {
    this.pictures = [];
    this.subjects = [];
    for (let i = 1; i <= Object.keys(data).length; i++) {
      if (data[i].p) {
        this.pictures.push(i);
      } else if (data[i].v || data[i].b) {
      } else {
        this.subjects.push(i);
      }
    }
  }

  private pictureName(lessonWord): string {
    let picName = lessonWord['e'].split(' ').join('-');
    return `${picName}.jpeg`;
  }

  private generateTwoPicture(w1, w2, indexOrder, n1, n2) {
    const res = { type: 'TwoPicture', indexOrder: indexOrder, dynamicPart: '' };
    res.dynamicPart = `{"options":[{"name":"${this.pictureName(w1)}","text":"${n1}"},
                                   {"name":"${this.pictureName(w2)}","text":"${n2}"}],"reverse":true}`.replace(/\s/g,'');
    return res;
  }

  private generateOneCheck(correctIndex, indexOrder, array) {
    const res = { type: 'OneCheck', indexOrder: indexOrder, dynamicPart : '' };
    let options = '';
    for (let i = 0; i < array.length; i++) {
        options += correctIndex === array[i] ? `{"text":"${array[i]}","isCorrect":"correct"}`
                                             : `{"text":"${array[i]}"}`;
        options += i !== array.length - 1 ? ',' : '';
    }
    res.dynamicPart = `{"options":[${options}]}`.replace(/\s/g,'');
    return res;
  }

  private generateFourPicture(w1, w2, w3, w4, indexOrder, n1, n2, n3, n4) {
    const res = { type: 'FourPicture', indexOrder: indexOrder, dynamicPart: '' };
    res.dynamicPart = `{"options":[{"name":"${this.pictureName(w1)}","text":"${n1}"},
                                   {"name":"${this.pictureName(w2)}","text":"${n2}"},
                                   {"name":"${this.pictureName(w3)}","text":"${n3}"},
                                   {"name":"${this.pictureName(w4)}","text":"${n4}"}],"reverse":true}`.replace(/\s/g,'');
    return res;
  }

  private generateSpeaking(indexOrder, n) {
    return { type: 'Speaking', dynamicPart: `{"question":"${n}"}`, indexOrder: indexOrder };
  }

  private generateWriting(indexOrder:number, n: number, isReverse?: boolean) {
    return isReverse === true
      ? { type: 'Writing', dynamicPart: `{"question":"${n}","reverse": true}`, indexOrder: indexOrder }
      : { type: 'Writing', dynamicPart: `{"question":"${n}"}`, indexOrder: indexOrder };
  }

  private generateMultiSelect(na: number, indexOrder: number, array, isReverse?: boolean, isListen?: boolean) {
    const res = { type: 'MultiSelect', indexOrder: indexOrder, dynamicPart: '' };
    let options = '';
    for (let i = 0; i < array.length; i++) {
        options += `{"text":"${array[i]}"}`;
        options += i !== array.length - 1 ? ',' : '';
    }
    const reverseOrListen = isListen === true ? `,"listen":${isListen}` : isReverse === true ? `,"reverse":${isReverse}` : '';
    res.dynamicPart = `{"question":"${na}","options":[${options}]${reverseOrListen}}`.replace(/\s/g,'');
    return res;
  }

  private randomLessThan(num): number {
    return Math.floor(Math.random() * (num - 1)) + 0;
  }

  private randomBetween(min, max): number {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  private trueOrFalse(): boolean {
    return Math.random() >= 0.5;
  }

  private generateBeginner(pictures, subjects, data) {
    let res = [];
    const maxIndex = subjects.length - 1;
    if (pictures.length >= 2) {
      res.push(this.generateTwoPicture(data[pictures[0]], data[pictures[1]], 10, pictures[0], pictures[1]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateTwoPicture(data[pictures[2]], data[pictures[3]], 20, pictures[2], pictures[3]));
    }
    if (maxIndex >= 4) {
      res.push(this.generateOneCheck(subjects[0], 30, [subjects[0], subjects[1], subjects[2], subjects[3]]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateFourPicture(data[pictures[0]], data[pictures[1]],
                                   data[pictures[2]], data[pictures[3]], 40,
                                   pictures[0], pictures[1], pictures[2], pictures[3]));
    }
    if (maxIndex >= 4) {
      res.push(this.generateOneCheck(subjects[1], 50, [subjects[0], subjects[1], subjects[2], subjects[3]]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateFourPicture(data[pictures[0]], data[pictures[1]],
                                   data[pictures[2]], data[pictures[3]], 60,
                                   pictures[0], pictures[1], pictures[2], pictures[3]));
    }
    for (let i = 0; i < 15; i = i + 5) {
      if (maxIndex >= i) {
        res.push(this.generateSpeaking(50+i*20, subjects[i]));
        if (i !== 0) {
          res.push(this.generateMultiSelect(subjects[i], 50+i*20, [subjects[this.randomLessThan(i)]], this.trueOrFalse()));
        }
      }
      if (maxIndex >= i+3) {
        res.push(this.generateOneCheck(subjects[i], 60+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
      }
      if (maxIndex >= i+1) {
        res.push(this.generateMultiSelect(subjects[i+1], 70+i*20, [subjects[this.randomLessThan(i+1)]], this.trueOrFalse()));
      }
      if (maxIndex >= i+2) {
        res.push(this.generateMultiSelect(subjects[i+2], 90+i*20, [subjects[this.randomLessThan(i+2)]], this.trueOrFalse()));
      }
      if (maxIndex >= i+3) {
        res.push(this.generateOneCheck(subjects[i+3], 80+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
      }
      if (maxIndex >= i+4) {
        res.push(this.generateMultiSelect(subjects[i+4], 100+i*20, [subjects[this.randomLessThan(i+4)]], this.trueOrFalse()));
      }
    }
    return res;
  }

  private generateIntermediate(pictures, subjects, data) {
    let res = [];
    const maxIndex = subjects.length - 1;
    if (pictures.length >= 2) {
      res.push(this.generateTwoPicture(data[pictures[0]], data[pictures[1]], 10, pictures[0], pictures[1]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateTwoPicture(data[pictures[2]], data[pictures[3]], 20, pictures[2], pictures[3]));
    }
    if (pictures.length >= 2) {
      res.push(this.generateWriting(30, pictures[this.randomBetween(0,1)]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateFourPicture(data[pictures[0]], data[pictures[1]],
                                   data[pictures[2]], data[pictures[3]], 40,
                                   pictures[0], pictures[1], pictures[2], pictures[3]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateWriting(42, pictures[this.randomBetween(2,3)]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateFourPicture(data[pictures[0]], data[pictures[1]],
                                   data[pictures[2]], data[pictures[3]], 44,
                                   pictures[0], pictures[1], pictures[2], pictures[3]));
    }
    for (let i = 0; i < 15; i = i + 5) {
      if (maxIndex >= i) {
        res.push(this.generateSpeaking(50+i*20, subjects[i]));
        if (i !== 0) {
          const tOrf = this.trueOrFalse();
          res.push(this.generateMultiSelect(subjects[i], 50+i*20, [subjects[this.randomLessThan(i)]], tOrf, tOrf ? true : undefined));
        }
      }
      if (maxIndex >= i+3) {
        res.push(this.generateOneCheck(subjects[i], 60+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
      }
      if (maxIndex >= i+1) {
        const tOrf = this.trueOrFalse();
        res.push(this.generateMultiSelect(subjects[i+1], 70+i*20, [subjects[this.randomLessThan(i+1)]], tOrf, tOrf ? true : undefined));
      }
      if (maxIndex >= i+2) {
        const tOrf = this.trueOrFalse();
        res.push(this.generateMultiSelect(subjects[i+2], 90+i*20, [subjects[this.randomLessThan(i+2)]], tOrf, tOrf ? undefined : true));
      }
      if (maxIndex >= i+3) {
        res.push(this.generateOneCheck(subjects[i+3], 80+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
      }
      if (maxIndex >= i+4) {
        const tOrf = this.trueOrFalse();
        res.push(this.generateMultiSelect(subjects[i+4], 100+i*20, [subjects[this.randomLessThan(i+4)]], tOrf, tOrf ? undefined : true));
      }
    }
    return res;
  }

  private generateAdvanced(pictures, subjects, data) {
    let res = [];
    if (pictures.length >= 2) {
      res.push(this.generateWriting(10, pictures[this.randomBetween(0,1)]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateWriting(20, pictures[this.randomBetween(2,3)]));
    }
    if (pictures.length >= 4) {
      res.push(this.generateFourPicture(data[pictures[0]], data[pictures[1]],
                                   data[pictures[2]], data[pictures[3]], 30,
                                   pictures[0], pictures[1], pictures[2], pictures[3]));
    }

    for (let i = 0; i < subjects.length; i++) {
      if (i % 5 === 0) {
        res.push(this.generateWriting(40+i, subjects[i], true));
      } else {
        res.push(this.generateWriting(40+i, subjects[i]));
      }
    }
    return res;
  }

}
