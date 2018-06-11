import { getTestBed, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ScoreUtil } from '../src/providers';

describe('Score Util', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [ ScoreUtil ]
    }).compileComponents();
  });

  it('Should resolve scores correctly', () => {
    const scoreUtil = getTestBed().get(ScoreUtil);
    for (let i = 0; i < 100; i++) {
      expect(scoreUtil.resolveLevelFrom(scoreUtil.resolveMaxScoreFrom(i))).toBe(i);
    }
  });

});