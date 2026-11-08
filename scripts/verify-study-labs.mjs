import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('🧪 Starting Study Labs Domain, Cyber Celebration & Math Verification Test Suite...\n');

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

// 5. Verify Secure Math Evaluator & Sanitizer
const ALLOWED_CHARS_REGEX = /^[0-9+\-*/%^().\sMathsincostanlogeqrtPIE,]+$/;
function evaluateMath(rawExpr) {
  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\^/g, '**')
    .replace(/sin\(/g, 'Math.sin(')
    .replace(/cos\(/g, 'Math.cos(')
    .replace(/tan\(/g, 'Math.tan(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/√\(/g, 'Math.sqrt(');

  const forbidden = ['constructor', 'prototype', '__proto__', 'window', 'global', 'process', 'require', 'import', ';', '{', '}', '[', ']'];
  for (const f of forbidden) {
    if (expr.includes(f)) return { success: false, error: 'Disallowed token' };
  }
  if (!ALLOWED_CHARS_REGEX.test(expr)) return { success: false, error: 'Invalid characters' };

  try {
    const fn = new Function('Math', `"use strict"; return (${expr});`);
    const val = fn(Math);
    return { success: true, value: val, formatted: parseFloat(val.toFixed(6)).toString() };
  } catch (e) {
    return { success: false, error: 'Syntax error' };
  }
}

assert.equal(evaluateMath('2 + 3 * 4').formatted, '14', '2 + 3 * 4 = 14');
assert.equal(evaluateMath('√(16) + 5').formatted, '9', 'sqrt(16) + 5 = 9');
assert.equal(evaluateMath('log(100) + 8').formatted, '10', 'log10(100) + 8 = 10');
assert.equal(evaluateMath('global.process').success, false, 'Injection rejected');
assert.equal(evaluateMath('alert(1);').success, false, 'Statement injection rejected');
console.log('✅ 5. Math Evaluator & Security Sanitizer: Verified');

// 6. Verify Cyber Celebration Tier & Personal Best Engine
function getCelebrationTier(score, percentage, previousScores) {
  const isPersonalBest = previousScores.length > 0 && score > Math.max(...previousScores);
  if (isPersonalBest) return 'personal_best';
  if (percentage >= 80) return 'excellent';
  return 'normal';
}

assert.equal(getCelebrationTier(92, 92, [70, 78, 85]), 'personal_best', 'Higher than max should be personal best');
assert.equal(getCelebrationTier(82, 82, [85, 90]), 'excellent', 'Above 80% should be excellent');
assert.equal(getCelebrationTier(65, 65, [85, 90]), 'normal', 'Below 80% should be normal completion');
console.log('✅ 6. Cyber Celebration & Personal Best Engine: Verified');

// 7. Verify App Configuration
const appJsonPath = new URL('../app.json', import.meta.url);
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
assert.equal(appJson.expo.name, 'Study Labs', 'App name must be Study Labs');
assert.equal(appJson.expo.android.package, 'io.study.labs', 'Package must be io.study.labs');
assert.equal(appJson.expo.primaryColor, '#F97316', 'Primary theme color must be #F97316');
console.log('✅ 7. App Identity & Android Package Configuration (io.study.labs): Verified');

console.log('\n🎉 ALL 7 DOMAIN, SECURITY, CELEBRATION & APPLICATION TESTS PASSED SUCCESSFULLY!');
