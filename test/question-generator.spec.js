const test = require('unit.js');
const testData = require('./question-generator.test-data.js');
const testData3 = require('./question-generator.test-data3.js');
const testData4 = require('./question-generator.test-data4.js');

function pictureName(lessonWord) {
  let picName = lessonWord['e'].split(' ').join('-');
  return `${picName}.jpeg`;
}

function generateTwoPicture(w1, w2, indexOrder, n1, n2) {
  const res = { type: 'TwoPicture', indexOrder: indexOrder };
  res.dynamicPart = `{"options":[{"name":"${pictureName(w1)}","text":"${n1}"},
                                 {"name":"${pictureName(w2)}","text":"${n2}"}],"reverse":true}`.replace(/\s/g,'');
  return res;
}

function generateOneCheck(correctIndex, indexOrder, array) {
  const res = { type: 'OneCheck', indexOrder: indexOrder };
  let options = '';
  for (let i = 0; i < array.length; i++) {
      options += correctIndex === array[i] ? `{"text":"${array[i]}","isCorrect":"correct"}`
                                           : `{"text":"${array[i]}"}`;
      options += i !== array.length - 1 ? ',' : '';
  }
  res.dynamicPart = `{"options":[${options}]}`.replace(/\s/g,'');
  return res;
}

function generateFourPicture(w1, w2, w3, w4, indexOrder, n1, n2, n3, n4) {
  const res = { type: 'FourPicture', indexOrder: indexOrder };
  res.dynamicPart = `{"options":[{"name":"${w1['t']}.jpeg","text":"${n1}"},
                                 {"name":"${w2['t']}.jpeg","text":"${n2}"},
                                 {"name":"${w3['t']}.jpeg","text":"${n3}"},
                                 {"name":"${w4['t']}.jpeg","text":"${n4}"}],"reverse":true}`.replace(/\s/g,'');
  return res;
}

function generateSpeaking(indexOrder, n) {
  return { type: 'Speaking', dynamicPart: `{"question":"${n}"}`, indexOrder: indexOrder };
}

function generateWriting(indexOrder, n, isReverse) {
  return isReverse === true
    ? { type: 'Writing', dynamicPart: `{"question":"${n}","reverse": true}`, indexOrder: indexOrder }
    : { type: 'Writing', dynamicPart: `{"question":"${n}"}`, indexOrder: indexOrder };
}

function generateMultiSelect(na, indexOrder, array, isReverse, isListen) {
  const res = { type: 'MultiSelect', indexOrder: indexOrder };
  let options = '';
  for (let i = 0; i < array.length; i++) {
      options += `{"text":"${array[i]}"}`;
      options += i !== array.length - 1 ? ',' : '';
  }
  const reverseOrListen = isListen === true ? `,"listen":${isListen}` : isReverse === true ? `,"reverse":${isReverse}` : '';
  res.dynamicPart = `{"question":"${na}","options":[${options}]${reverseOrListen}}`.replace(/\s/g,'');
  return res;
}

function randomLessThan(num) {
  return Math.floor(Math.random() * (num - 1)) + 0;
}

function randomBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function trueOrFalse() {
  return Math.random() >= 0.5;
}

function generateBeginner(pictures, subjects, data) {
  let res = [];
  const maxIndex = subjects.length - 1;
  if (pictures.length >= 2) {
    res.push(generateTwoPicture(data[pictures[0]], data[pictures[1]], 10, pictures[0], pictures[1]));
  }
  if (pictures.length >= 4) {
    res.push(generateTwoPicture(data[pictures[2]], data[pictures[3]], 20, pictures[2], pictures[3]));
  }
  if (maxIndex >= 4) {
    res.push(generateOneCheck(subjects[0], 30, [subjects[0], subjects[1], subjects[2], subjects[3]]));
  }
  if (pictures.length >= 4) {
    res.push(generateFourPicture(data[pictures[0]], data[pictures[1]],
                                 data[pictures[2]], data[pictures[3]], 40,
                                 pictures[0], pictures[1], pictures[2], pictures[3]));
  }
  if (maxIndex >= 4) {
    res.push(generateOneCheck(subjects[1], 50, [subjects[0], subjects[1], subjects[2], subjects[3]]));
  }
  if (pictures.length >= 4) {
    res.push(generateFourPicture(data[pictures[0]], data[pictures[1]],
                                 data[pictures[2]], data[pictures[3]], 60,
                                 pictures[0], pictures[1], pictures[2], pictures[3]));
  }

  for (let i = 0; i < 11; i = i + 5) {
    if (maxIndex >= i) {
      res.push(generateSpeaking(50+i*20, subjects[i]));
      if (i !== 0) {
        res.push(generateMultiSelect(subjects[i], 50+i*20, [subjects[randomLessThan(i)]], trueOrFalse()));
      }
    }
    if (maxIndex >= i+3) {
      res.push(generateOneCheck(subjects[i], 60+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
    }
    if (maxIndex >= i+1) {
      res.push(generateMultiSelect(subjects[i+1], 70+i*20, [subjects[randomLessThan(i+1)]], trueOrFalse()));
    }
    if (maxIndex >= i+2) {
      res.push(generateMultiSelect(subjects[i+2], 90+i*20, [subjects[randomLessThan(i+2)]], trueOrFalse()));
    }
    if (maxIndex >= i+3) {
      res.push(generateOneCheck(subjects[i+3], 80+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
    }
    if (maxIndex >= i+4) {
      res.push(generateMultiSelect(subjects[i+4], 100+i*20, [subjects[randomLessThan(i+4)]], trueOrFalse()));
    }
  }

  return res;
}

function generateIntermediate(pictures, subjects, data) {
  let res = [];
  const maxIndex = subjects.length - 1;
  if (pictures.length >= 2) {
    res.push(generateTwoPicture(data[pictures[0]], data[pictures[1]], 10, pictures[0], pictures[1]));
  }
  if (pictures.length >= 4) {
    res.push(generateTwoPicture(data[pictures[2]], data[pictures[3]], 20, pictures[2], pictures[3]));
  }
  if (pictures.length >= 2) {
    res.push(generateWriting(30, pictures[randomBetween(0,1)]));
  }
  if (pictures.length >= 4) {
    res.push(generateFourPicture(data[pictures[0]], data[pictures[1]],
                                 data[pictures[2]], data[pictures[3]], 40,
                                 pictures[0], pictures[1], pictures[2], pictures[3]));
  }
  if (pictures.length >= 4) {
    res.push(generateWriting(42, pictures[randomBetween(2,3)]));
  }
  if (pictures.length >= 4) {
    res.push(generateFourPicture(data[pictures[0]], data[pictures[1]],
                                 data[pictures[2]], data[pictures[3]], 44,
                                 pictures[0], pictures[1], pictures[2], pictures[3]));
  }

  for (let i = 0; i < 15; i = i + 5) {
    if (maxIndex >= i) {
      res.push(generateSpeaking(50+i*20, subjects[i]));
      if (i !== 0) {
        const tOrf = trueOrFalse();
        res.push(generateMultiSelect(subjects[i], 50+i*20, [subjects[randomLessThan(i)]], tOrf, tOrf ? true : undefined));
      }
    }
    if (maxIndex >= i+3) {
      res.push(generateOneCheck(subjects[i], 60+i*20, [subjects[i+1], subjects[i+2], subjects[i+3]]));
    }
    if (maxIndex >= i+1) {
      const tOrf = trueOrFalse();
      res.push(generateMultiSelect(subjects[i+1], 70+i*20, [subjects[randomLessThan(i+1)]], tOrf, tOrf ? true : undefined));
    }
    if (maxIndex >= i+2) {
      const tOrf = trueOrFalse();
      res.push(generateMultiSelect(subjects[i+2], 90+i*20, [subjects[randomLessThan(i+2)]], tOrf, tOrf ? undefined : true));
    }
    if (maxIndex >= i+3) {
      res.push(generateOneCheck(subjects[i+3], 80+i*20, [subjects[i], subjects[i+1], subjects[i+2], subjects[i+3]]));
    }
    if (maxIndex >= i+4) {
      const tOrf = trueOrFalse();
      res.push(generateMultiSelect(subjects[i+4], 100+i*20, [subjects[randomLessThan(i+4)]], tOrf, tOrf ? undefined : true));
    }
  }
  return res;
}

function generateAdvanced(pictures, subjects, data) {
  let res = [];
  const maxIndex = subjects.length - 1;
  if (pictures.length >= 2) {
    res.push(generateWriting(10, pictures[randomBetween(0,1)]));
  }
  if (pictures.length >= 4) {
    res.push(generateWriting(20, pictures[randomBetween(2,3)]));
  }
  if (pictures.length >= 4) {
    res.push(generateFourPicture(data[pictures[0]], data[pictures[1]],
                                 data[pictures[2]], data[pictures[3]], 30,
                                 pictures[0], pictures[1], pictures[2], pictures[3]));
  }

  for (let i = 0; i < subjects.length; i++) {
    if (i % 5 === 0) {
      res.push(generateWriting(40+i, subjects[i], true));
    } else {
      res.push(generateWriting(40+i, subjects[i]));
    }
  }
  return res;
}

function generate(lw) {
  const res = [];
  res.push(generateTwoPicture(lw[1], lw[2], 10, 1, 2));
  res.push(generateTwoPicture(lw[3], lw[4], 20, 3, 4));
  res.push(generateOneCheck(5, 30, [5, 6, 7, 8]));
  res.push(generateFourPicture(lw[1], lw[2], lw[3], lw[4], 40, 1, 2, 3, 4));
  res.push(generateOneCheck(6, 50, [5, 6, 7, 8]));
  res.push(generateSpeaking(60, 9));
  res.push(generateMultiSelect(8, 70, [9]));
  res.push(generateSpeaking(80, 10));
  res.push(generateMultiSelect(7, 90, [6], true));
  res.push(generateSpeaking(100, 11));
  res.push(generateOneCheck(15, 110, [12, 13, 14, 15]));
  res.push(generateSpeaking(120, 16));
  res.push(generateOneCheck(13, 130, [12, 13, 14, 15]));
  res.push(generateMultiSelect(17, 140, [5], true));
  res.push(generateMultiSelect(9, 150, [13]));
  res.push(generateMultiSelect(15, 160, [19], true));
  res.push(generateSpeaking(170, 8));
  res.push(generateMultiSelect(14, 180, [12], undefined, true));
  return res;
}

let pictures, subjects;
function analysis(data) {
  pictures = [];
  subjects = [];
  for (let i = 1; i <= Object.keys(data).length; i++) {
    if (data[i].p) {
      pictures.push(i);
    } else if (data[i].v || data[i].b) {
    } else {
      subjects.push(i);
    }
  }
}
analysis(testData3.data());

const res = generate(testData.data());
const res2 = generateBeginner(pictures, subjects, testData3.data());
const res3 = generateIntermediate(pictures, subjects, testData3.data());
const res4 = generateAdvanced(pictures, subjects, testData3.data());
analysis(testData4.data());
const res5 = generateIntermediate(pictures, subjects, testData4.data());
const res6 = generateBeginner(pictures, subjects, testData4.data());
const res7 = generateAdvanced(pictures, subjects, testData4.data());

// test.dump(res7.length);
test.value(11).isEqualTo(res7.length);
test.value(16).isEqualTo(res6.length);
test.value(16).isEqualTo(res5.length);
test.value(23).isEqualTo(res4.length);
test.value(26).isEqualTo(res3.length);
test.value(26).isEqualTo(res2.length);

// test.dump(res[17], questions[17]);
function assertIndex(index) {
  test.value(res[index].type).isEqualTo(testData.questions()[index].type);
  test.value(res[index].indexOrder).isEqualTo(testData.questions()[index].indexOrder);
  test.value(res[index].dynamicPart).isEqualTo(testData.questions()[index].dynamicPart);
}
for (let i = 0; i < 18; i++) {
  assertIndex(i);
}
