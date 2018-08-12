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
    expect(scoreUtil.resolveMaxScoreFrom(0)).toBe(49);
    expect(scoreUtil.resolveMaxScoreFrom(1)).toBe(99);
    expect(scoreUtil.resolveMaxScoreFrom(-1)).toBe(49);
  });

});