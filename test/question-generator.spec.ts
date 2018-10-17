import { getTestBed, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { QuestionGenerator } from '../src/providers';

const testData = require('./question-generator.test-data.js');
// const testData3 = require('./question-generator.test-data3.js');
// const testData4 = require('./question-generator.test-data4.js');

describe('Question Generator', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [ NO_ERRORS_SCHEMA],
      providers: [QuestionGenerator]
    }).compileComponents();
  });

  it('Return exact result for each question method', () => {
    const qg = getTestBed().get(QuestionGenerator);
    const lw = testData.data();
    const res = [];
    res.push(qg.generateTwoPicture(lw[1], lw[2], 10, 1, 2));
    res.push(qg.generateTwoPicture(lw[3], lw[4], 20, 3, 4));
    res.push(qg.generateSpellSelect(30, 3));
    res.push(qg.generateFourPicture(lw[1], lw[2], lw[3], lw[4], 40, 1, 2, 3, 4));
    res.push(qg.generateOneCheck(6, 50, [5, 6, 7, 8]));
    res.push(qg.generateSpeaking(60, 9));
    res.push(qg.generateMultiSelect(8, 70, [9]));
    res.push(qg.generateSpeaking(80, 10));
    res.push(qg.generateMultiSelect(7, 90, [6], true));
    res.push(qg.generateSpeaking(100, 11));
    res.push(qg.generateOneCheck(15, 110, [12, 13, 14, 15]));
    res.push(qg.generateSpeaking(120, 16));
    res.push(qg.generateOneCheck(13, 130, [12, 13, 14, 15]));
    res.push(qg.generateMultiSelect(17, 140, [5], true));
    res.push(qg.generateMultiSelect(9, 150, [13]));
    res.push(qg.generateMultiSelect(15, 160, [19], true));
    res.push(qg.generateSpeaking(170, 8));
    res.push(qg.generateMultiSelect(14, 180, [12], undefined, true));
    for (let i = 0; i < 18; i++) {
      expect(res[i].type).toBe(testData.questions()[i].type);
      expect(res[i].indexOrder).toBe(testData.questions()[i].indexOrder);
      expect(res[i].dynamicPart).toBe(testData.questions()[i].dynamicPart);
    }
  });

  it('Should generate array of questions', () => {
    // const questionGenerator = getTestBed().get(QuestionGenerator);
    // const res3_1 = questionGenerator.generate(testData3.data(), 'Beginner');
    // const res3_2 = questionGenerator.generate(testData3.data(), 'Intermediate');
    // const res3_3 = questionGenerator.generate(testData3.data(), 'Advanced');
    // expect(res3_1.length).toBe(28);
    // expect(res3_2.length).toBe(27);
    // expect(res3_3.length).toBe(24);
    // const res4_1 = questionGenerator.generate(testData4.data(), 'Beginner');
    // const res4_2 = questionGenerator.generate(testData4.data(), 'Intermediate');
    // const res4_3 = questionGenerator.generate(testData4.data(), 'Advanced');
    // expect(res4_1.length).toBe(14);
    // expect(res4_2.length).toBe(13);
    // expect(res4_3.length).toBe(10);
  });

});