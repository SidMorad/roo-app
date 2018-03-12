var test = require('unit.js');

var example = 'hello';

test.value(example).isEqualTo('hello');

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
  } else if (between(total, 2000, 5000)) {
    return 500;
  } else if (between(total, 5000, 10000)) {
    return 1000;
  } else if (between(total, 10000, 15000)) {
    return 2000;
  } else if (between(total, 15000, 50000)) {
    return 3000;
  } else if (between(total, 50000, 100000)) {
    return 5000;
  } else {
    return 10000;
  }
}


function resolveLevelFrom(total) {
  let divider = determineDivider(total);
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

test.dump(resolveLevelFrom(130001));
test.value(resolveLevelFrom(130000)).isEqualTo(50);
test.value(resolveLevelFrom(120000)).isEqualTo(49);
test.value(resolveLevelFrom(110000)).isEqualTo(48);
test.value(resolveLevelFrom(100000)).isEqualTo(47);
test.value(resolveLevelFrom(65000)).isEqualTo(40);
test.value(resolveLevelFrom(60000)).isEqualTo(39);
test.value(resolveLevelFrom(55000)).isEqualTo(38);
test.value(resolveLevelFrom(50000)).isEqualTo(37);
test.value(resolveLevelFrom(48000)).isEqualTo(37);
test.value(resolveLevelFrom(45000)).isEqualTo(36);
test.value(resolveLevelFrom(42000)).isEqualTo(35);
test.value(resolveLevelFrom(39000)).isEqualTo(34);
test.value(resolveLevelFrom(36000)).isEqualTo(33);
test.value(resolveLevelFrom(33000)).isEqualTo(32);
test.value(resolveLevelFrom(30000)).isEqualTo(31);
test.value(resolveLevelFrom(27000)).isEqualTo(30);
test.value(resolveLevelFrom(24000)).isEqualTo(29);
test.value(resolveLevelFrom(21000)).isEqualTo(28);
test.value(resolveLevelFrom(18000)).isEqualTo(27);
test.value(resolveLevelFrom(17000)).isEqualTo(26);
test.value(resolveLevelFrom(16000)).isEqualTo(26);
test.value(resolveLevelFrom(15000)).isEqualTo(26);
test.value(resolveLevelFrom(14000)).isEqualTo(26);
test.value(resolveLevelFrom(12000)).isEqualTo(25);
test.value(resolveLevelFrom(11000)).isEqualTo(24);
test.value(resolveLevelFrom(10000)).isEqualTo(24);
test.value(resolveLevelFrom(9000)).isEqualTo(23);
test.value(resolveLevelFrom(8000)).isEqualTo(22);
test.value(resolveLevelFrom(7000)).isEqualTo(21);
test.value(resolveLevelFrom(6000)).isEqualTo(20);
test.value(resolveLevelFrom(5001)).isEqualTo(19);
test.value(resolveLevelFrom(5000)).isEqualTo(19);
test.value(resolveLevelFrom(4500)).isEqualTo(18);
test.value(resolveLevelFrom(4000)).isEqualTo(17);
test.value(resolveLevelFrom(3500)).isEqualTo(16);
test.value(resolveLevelFrom(3000)).isEqualTo(15);
test.value(resolveLevelFrom(2500)).isEqualTo(14);
test.value(resolveLevelFrom(2001)).isEqualTo(13);
test.value(resolveLevelFrom(1800)).isEqualTo(12);
test.value(resolveLevelFrom(1500)).isEqualTo(11);
test.value(resolveLevelFrom(1200)).isEqualTo(10);
test.value(resolveLevelFrom(1000)).isEqualTo(9);
test.value(resolveLevelFrom(800)).isEqualTo(8);
test.value(resolveLevelFrom(600)).isEqualTo(7);
test.value(resolveLevelFrom(500)).isEqualTo(6);
test.value(resolveLevelFrom(400)).isEqualTo(5);
test.value(resolveLevelFrom(300)).isEqualTo(4);
test.value(resolveLevelFrom(299)).isEqualTo(3);
test.value(resolveLevelFrom(200)).isEqualTo(3);
test.value(resolveLevelFrom(199)).isEqualTo(2);
test.value(resolveLevelFrom(101)).isEqualTo(2);
test.value(resolveLevelFrom(100)).isEqualTo(2);
test.value(resolveLevelFrom(99)).isEqualTo(1);
test.value(resolveLevelFrom(66)).isEqualTo(1);
test.value(resolveLevelFrom(50)).isEqualTo(1);
test.value(resolveLevelFrom(49)).isEqualTo(0);
test.value(resolveLevelFrom(6)).isEqualTo(0);
