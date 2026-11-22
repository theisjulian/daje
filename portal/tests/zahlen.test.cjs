const assert = require('node:assert/strict');
global.document = { addEventListener() {} };
global.localStorage = { getItem: () => null, setItem() {} };
const { numIt, numVariants, ordIt, timeIt, dateIt, nuJudge } = require('../dist/zahlen.js');
// Zahlwörter
assert.equal(numIt(0), 'zero');
assert.equal(numIt(3), 'tre');
assert.equal(numIt(23), 'ventitré');
assert.equal(numIt(28), 'ventotto');
assert.equal(numIt(101), 'centouno');
assert.equal(numIt(108), 'centotto');
assert.equal(numIt(1000), 'mille');
assert.equal(numIt(2000), 'duemila');
// -tré trägt in jeder Zusammensetzung den Akzent
assert.equal(numIt(103), 'centotré');
assert.equal(numIt(203), 'duecentotré');
assert.equal(numIt(123), 'centoventitré');
assert.equal(numIt(1003), 'milletré');
assert.equal(numIt(2003), 'duemilatré');
assert.equal(numIt(12503), 'dodicimilacinquecentotré');
// … aber nicht vor -mila und nicht allein vor milioni
assert.equal(numIt(3000), 'tremila');
assert.equal(numIt(23000), 'ventitremila');
assert.equal(numIt(103000), 'centotremila');
assert.equal(numIt(3000000), 'tre milioni');
assert.equal(numIt(1000000), 'un milione');
for (let n = 0; n <= 20000; n++) {
  const w = numIt(n);
  assert.ok(!/tre$/.test(w) || n === 3, 'Akzent fehlt: ' + n + ' ' + w);
  assert.ok(!/tré(?!$)/.test(w), 'Akzent im Wortinneren: ' + n + ' ' + w);
}
assert.equal(nuJudge({ answers: numVariants(103) }, 'centotré'), 'ok');
assert.equal(nuJudge({ answers: numVariants(103) }, 'centotre'), 'accent');
assert.equal(nuJudge({ answers: numVariants(1003) }, 'Milletré'), 'ok');
assert.equal(nuJudge({ answers: numVariants(3000) }, 'tremila'), 'ok');
assert.equal(ordIt(3), 'terzo');
assert.equal(ordIt(23), 'ventitreesimo');
assert.equal(ordIt(11, true), 'undicesima');
// Uhrzeit
const time = (h, m) => ({ answers: timeIt(h, m), prefix: true });
assert.equal(timeIt(2, 45)[0], 'sono le tre meno un quarto');
assert.ok(timeIt(2, 45).includes('sono le due e tre quarti'));
assert.equal(nuJudge(time(2, 45), 'Sono le due e tre quarti.'), 'ok');
assert.equal(nuJudge(time(2, 45), 'le due e tre quarti'), 'ok');
assert.equal(nuJudge(time(2, 45), 'sono le due e quarantacinque'), 'ok');
assert.equal(nuJudge(time(2, 30), 'sono le due e tre quarti'), 'wrong');
assert.ok(!timeIt(2, 15).includes('sono le due e tre quarti'));
assert.equal(nuJudge(time(13, 0), "è l'una"), 'ok');
assert.equal(nuJudge(time(15, 30), 'sono le quindici e trenta'), 'ok');
// 00:xx: mezzanotte und offiziell „le zero“
assert.equal(timeIt(0, 15)[0], 'è mezzanotte e un quarto');
assert.equal(nuJudge(time(0, 15), 'sono le zero e quindici'), 'ok');
assert.equal(nuJudge(time(0, 0), 'è mezzanotte'), 'ok');
assert.equal(nuJudge(time(1, 15), 'sono le zero e quindici'), 'wrong');
// Datum: auch als ganzer Satz
const date = (d, mo) => ({ answers: dateIt(d, mo), lead: true });
assert.equal(nuJudge(date(3, 4), 'il tre maggio'), 'ok');
assert.equal(nuJudge(date(3, 4), 'Oggi è il tre maggio.'), 'ok');
assert.equal(nuJudge(date(3, 4), 'È il tre maggio'), 'ok');
assert.equal(nuJudge(date(3, 4), 'oggi e il tre maggio'), 'accent');
assert.equal(nuJudge(date(3, 4), 'oggi è il due maggio'), 'wrong');
assert.equal(nuJudge(date(8, 0), "Oggi è l’otto gennaio"), 'ok');
assert.equal(nuJudge(date(1, 2), 'oggi è il primo marzo'), 'ok');
assert.equal(nuJudge({ answers: numVariants(5) }, 'oggi è cinque'), 'wrong');
console.log('Zahlen passed.');
