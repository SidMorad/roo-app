const test = require('unit.js');

function between(x, min, max) {
  return x >= min && x <= max;
}

function determineDivider(total) {
  if (between(total, 0, 100)) {
    return 50;
  } else if (between(total, 100, 500)) {
    return 100;
  } else if (between(total, 500, 1000)) {
    return 200;
  } else if (between(total, 1000, 2000)) {
    return 300;
  } else if (between(total, 2000, 5300)) {
    return 500;
  } else if (between(total, 5300, 12300)) {
    return 1000;
  } else if (between(total, 12300, 26300)) {
    return 2000;
  } else if (between(total, 26300, 47300)) {
    return 3000;
  } else if (between(total, 27300, 75300)) {
    return 4000;
  } else if (between(total, 75300, 110300)) {
    return 5000;
  } else {
    return 10000;
  }
}

function resolveLevelFrom(total) {
  let divider = determineDivider(total);
  if (divider === 50) {
    return Math.floor(total / 50);
  } else if (divider === 100) {
    return 1 + Math.floor(total / 100);
  } else if (divider === 200) {
    return 4 + Math.floor(total / 200);
  } else if (divider === 300) {
    return 6 + Math.floor(total / 300);
  } else if (divider === 500) {
    return 8 + Math.floor(total / 500);
  } else if (divider === 1000) {
    return 13 + Math.floor(total / 1000);
  } else if (divider === 2000) {
    return 19 + Math.floor(total / 2000);
  } else if (divider === 3000) {
    return 24 + Math.floor(total / 3000);
  } else if (divider === 4000) {
    return 28 + Math.floor(total / 4000);
  } else if (divider === 5000) {
    return 31 + Math.floor(total / 5000);
  } else if (divider === 10000) {
    return 42 + Math.floor(total / 10000);
  }
}

function resolveMaxScoreFrom(level) {
  switch(level) {
    case 0: case 1:
      return 50 + level * 50 - 1;
    case 2: case 3: case 4: case 5: case 6:
      return 100 + (level - 1) * 100 - 1;
    case 7: case 8: case 9:
      return 600 + (level - 6) * 200 - 1;
    case 10: case 11:
      return 1200 + (level - 9) * 300 - 1;
    case 12: case 13: case 14: case 15: case 16: case 17: case 18:
      return 1800 + (level - 11) * 500 - 1;
    case 19: case 20: case 21: case 22: case 23: case 24: case 25:
      return 5300 + (level - 18) * 1000 - 1;
    case 26: case 27: case 28: case 29: case 30: case 31: case 32:
      return 12300 + (level - 25) * 2000 - 1;
    case 33: case 34: case 35: case 36: case 37: case 38: case 39:
      return 26300 + (level - 32) * 3000 - 1;
    case 40: case 41: case 42: case 43: case 44: case 45: case 46:
      return 47300 + (level - 39) * 4000 - 1;
    case 47: case 48: case 49: case 50: case 51: case 52: case 53:
      return 75300 + (level - 46) * 5000 - 1;
    default:
      return 110300 + (level - 53) * 10000 - 1;
  }
}

for (var i = 0; i < 100; i++) {
  // test.dump(i, resolveScoreFrom(i), determineDivider(resolveScoreFrom(i)), resolveLevelFrom(resolveScoreFrom(i)));
  test.value(resolveLevelFrom(resolveMaxScoreFrom(i))).isEqualTo(i);
}
// test.dump(determineDivider(resolveMaxScoreFrom(99)), resolveLevelFrom(resolveMaxScoreFrom(99)));