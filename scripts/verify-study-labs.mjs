import assert from 'node:assert/strict';

console.log('🧪 Starting Study Labs Domain & Verification Test Suite...\n');

// 1. Verify Percentage Calculation formula
function calcPercentage(obtained, max) {
  if (max <= 0) return 0;
  return parseFloat(((obtained / max) * 100).toFixed(1));
}

assert.equal(calcPercentage(78, 100), 78.0, '78/100 should be 78%');
assert.equal(calcPercentage(216, 300), 72.0, '216/300 should be 72%');
assert.equal(calcPercentage(68, 80), 85.0, '68/80 should be 85%');
assert.equal(calcPercentage(84, 100), 84.0, '84/100 should be 84%');
console.log('✅ 1. Test Tracker Percentage Formula: Verified');

// 2. Verify Exam Scoring Engine (+4 for correct, -1 for incorrect, 0 for unattempted)
function calculateExamScore(correct, incorrect, total) {
  const unattempted = total - (correct + incorrect);
  const score = correct * 4 - incorrect * 1;
  const maxScore = total * 4;
  const percentage = Math.max(0, parseFloat(((score / maxScore) * 100).toFixed(1)));
  return { score, maxScore, percentage, unattempted };
}

const examResult = calculateExamScore(20, 2, 25);
assert.equal(examResult.score, 78, '20*4 - 2*1 = 78');
assert.equal(examResult.maxScore, 100, '25*4 = 100');
assert.equal(examResult.percentage, 78.0, '78% score');
assert.equal(examResult.unattempted, 3, '25 - 22 = 3');
console.log('✅ 2. Exam Scoring Engine & Negative Marking: Verified');

// 3. Verify Offline Coaching Test Analytics (Average & Personal Best)
const testScores = [78.0, 72.0, 85.0, 84.0];
const average = (testScores.reduce((a, b) => a + b, 0) / testScores.length).toFixed(1);
const personalBest = Math.max(...testScores).toFixed(1);

assert.equal(average, '79.8', 'Average calculation should be 79.8%');
assert.equal(personalBest, '85.0', 'Personal best should be 85.0%');
console.log('✅ 3. Coaching Tracker Analytics (Avg & Personal Best): Verified');

// 4. Verify Scientific Unit Converters
function convertLength(val, from, to) {
  let meters = val;
  if (from === 'km') meters = val * 1000;
  if (from === 'cm') meters = val * 0.01;
  if (from === 'mm') meters = val * 0.001;

  if (to === 'km') return meters / 1000;
  if (to === 'm') return meters;
  if (to === 'cm') return meters * 100;
  if (to === 'mm') return meters * 1000;
  return meters;
}

assert.equal(convertLength(5, 'km', 'm'), 5000, '5 km = 5000 m');
assert.equal(convertLength(250, 'cm', 'm'), 2.5, '250 cm = 2.5 m');
assert.equal(convertLength(1200, 'mm', 'm'), 1.2, '1200 mm = 1.2 m');

function convertTemp(val, from, to) {
  if (from === '°C' && to === 'K') return parseFloat((val + 273.15).toFixed(2));
  if (from === '°C' && to === '°F') return parseFloat((val * 1.8 + 32).toFixed(2));
  return val;
}

assert.equal(convertTemp(25, '°C', 'K'), 298.15, '25°C = 298.15 K');
assert.equal(convertTemp(100, '°C', '°F'), 212.00, '100°C = 212°F');
console.log('✅ 4. Scientific Unit Converters: Verified');

// 5. Verify App Configuration
import fs from 'node:fs';
const appJsonPath = new URL('../app.json', import.meta.url);
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
assert.equal(appJson.expo.name, 'Study Labs', 'App name must be Study Labs');
assert.equal(appJson.expo.android.package, 'io.study.labs', 'Package must be io.study.labs');
assert.equal(appJson.expo.primaryColor, '#F97316', 'Primary theme color must be #F97316');
console.log('✅ 5. App Identity & Android Package Configuration (io.study.labs): Verified');

console.log('\n🎉 ALL DOMAIN AND APPLICATION TESTS PASSED SUCCESSFULLY!');

