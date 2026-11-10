import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  classifyQuestionDifficulty,
  GeminiAIService,
  REASONING_POWER_OPTIONS,
  resolveModelForPrompt,
} from '../src/services/gemini.ts';
import {
  CHAPTERS,
  EXAM_BANK_PRESETS,
  FORMULA_CARDS,
  SAMPLE_QUESTIONS,
} from '../src/data/curriculumData.ts';
import {
  aggregateDailyActivity,
  build7DayLeaderboard,
  buildSeedAttemptLogs,
  computeDifficultyBreakdown,
  computeHistorySummary,
  computeStreakAndWeek,
  evaluateScoreReminder,
  formatLocalDateKey,
  getLatestQuestionStatusMap,
  getMonthHeatmapWeeks,
  resolveLeagueTier,
} from '../src/utils/activityStats.ts';
import {
  buildKatexDocumentHtml,
  hasRichMathOrMarkdown,
  markdownAndLatexToBodyHtml,
  normalizeMathDelimiters,
} from '../src/utils/mathFormatting.ts';
import { convertPlainTextToLatex } from '../src/utils/noteLatexConverter.ts';
import { filterCustomQuestions } from '../src/utils/customTestBuilder.ts';
import { getThemeColors } from '../src/theme/colors.ts';

console.log('🧪 Starting Study Labs Domain, Cyber Celebration, LaTeX, SFX & AI Verification Suite...\n');

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
assert.equal(convertTemp(100, '°C', '°F'), 212.0, '100°C = 212°F');
console.log('✅ 4. Scientific Unit Converters: Verified');

// 5. Verify Secure Math Evaluator & Sanitizer
const ALLOWED_CHARS_REGEX = /^[0-9+\-*/%^().\sMathsincostanlogeqrtPIE,]+$/;
function evaluateMath(rawExpr) {
  const expr = rawExpr
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

  const forbidden = [
    'constructor',
    'prototype',
    '__proto__',
    'window',
    'global',
    'process',
    'require',
    'import',
    ';',
    '{',
    '}',
    '[',
    ']',
  ];
  for (const f of forbidden) {
    if (expr.includes(f)) return { success: false, error: 'Disallowed token' };
  }
  if (!ALLOWED_CHARS_REGEX.test(expr)) return { success: false, error: 'Invalid characters' };

  try {
    const fn = new Function('Math', `"use strict"; return (${expr});`);
    const val = fn(Math);
    return { success: true, value: val, formatted: parseFloat(val.toFixed(6)).toString() };
  } catch {
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

assert.equal(
  getCelebrationTier(92, 92, [70, 78, 85]),
  'personal_best',
  'Higher than max should be personal best'
);
assert.equal(
  getCelebrationTier(82, 82, [85, 90]),
  'excellent',
  'Above 80% should be excellent'
);
assert.equal(
  getCelebrationTier(65, 65, [85, 90]),
  'normal',
  'Below 80% should be normal completion'
);
console.log('✅ 6. Cyber Celebration & Personal Best Engine: Verified');

// 7. Verify App Configuration
const appJsonPath = new URL('../app.json', import.meta.url);
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
assert.equal(appJson.expo.name, 'Study Labs', 'App name must be Study Labs');
assert.equal(appJson.expo.android.package, 'io.study.labs', 'Package must be io.study.labs');
assert.equal(appJson.expo.primaryColor, '#F97316', 'Primary theme color must be #F97316');
console.log('✅ 7. App Identity & Android Package Configuration (io.study.labs): Verified');

// 8. Verify Model Reasoning Power Routing (Manual + Auto Difficulty)
assert.equal(REASONING_POWER_OPTIONS.length, 4, 'Should expose Auto, Flash Lite, Flash, Pro');
assert.equal(
  resolveModelForPrompt('flash-lite', 'Prove Gauss Law rigorously').modelId,
  'gemini-flash-lite-latest',
  'Manual Flash Lite overrides difficulty'
);
assert.equal(
  resolveModelForPrompt('flash', 'What is SI unit of mass?').modelId,
  'gemini-flash-latest',
  'Manual Flash overrides difficulty'
);
assert.equal(
  resolveModelForPrompt('pro', 'Define work function').modelId,
  'gemini-pro-latest',
  'Manual Pro overrides difficulty'
);
assert.equal(
  resolveModelForPrompt('auto', 'What is the SI unit of work function?').modelId,
  'gemini-flash-lite-latest',
  'Auto selects Flash Lite for Easy question'
);
assert.equal(
  resolveModelForPrompt('auto', 'Explain Einstein photoelectric equation with graph').modelId,
  'gemini-flash-latest',
  'Auto selects Flash for Medium question'
);
assert.equal(
  resolveModelForPrompt('auto', 'Prove moment of inertia of a uniform disc (JEE Advanced)').modelId,
  'gemini-pro-latest',
  'Auto selects Pro for Hard question'
);
assert.equal(classifyQuestionDifficulty('Simple text', 'Hard'), 'Hard', 'Explicit difficulty honored');
const offlineIlate = GeminiAIService.generateOfflineEducationalResponse('Integration by parts formula');
assert.equal(
  offlineIlate.text.includes('\\\\arcsin'),
  false,
  'Offline ILATE response must not have double-escaped \\\\arcsin'
);
assert.equal(
  offlineIlate.text.includes('\\arcsin'),
  true,
  'Offline ILATE response must contain valid \\arcsin LaTeX'
);
console.log('✅ 8. AI Model Reasoning Power Router (Auto + Manual Latest Models): Verified');

// 9. Verify Question Bank, Curriculum, Exam Presets & Formula Cards LaTeX Integrity
assert.ok(SAMPLE_QUESTIONS.length >= 12, 'Should contain expanded 12+ sample questions');
assert.ok(FORMULA_CARDS.length >= 12, 'Should contain 12+ formula flashcards');
assert.ok(EXAM_BANK_PRESETS.length >= 4, 'Should contain exam presets');
assert.ok(
  CHAPTERS.some((c) => c.subjectId === 'biology'),
  'Chapters should cover Physics, Chemistry, Math & Biology'
);

for (const q of SAMPLE_QUESTIONS) {
  assert.ok(Array.isArray(q.hints) && q.hints.length === 3, `${q.id} must have 3 typed hints`);
  const categories = q.hints.map((h) => h.category);
  assert.deepEqual(categories, ['concept', 'formula', 'strategy'], `${q.id} hint categories`);
  assert.ok(
    hasRichMathOrMarkdown(q.explanation),
    `${q.id} explanation should use LaTeX/rich math`
  );
  // Ensure no accidental JS control characters like formfeed/tab inside LaTeX strings
  for (const field of [q.prompt, q.explanation, ...q.hints.map((h) => h.content)]) {
    assert.equal(/[\f\t\v\b]/.test(field), false, `${q.id} contains accidental control character`);
  }
}
for (const card of FORMULA_CARDS) {
  assert.ok(card.formula.includes('$'), `${card.id} formula must contain KaTeX delimiter`);
  for (const field of [card.formula, card.explanation, card.variables]) {
    assert.equal(/[\f\t\v\b]/.test(field), false, `${card.id} formula card contains control character`);
  }
}
const qM2 = SAMPLE_QUESTIONS.find((q) => q.id === 'q_m2');
assert.equal(qM2?.numericalAnswer, 2.45, 'q_m2 shortest distance sqrt(293)/7 ≈ 2.45');
console.log('✅ 9. Curriculum, Formula Cards, LaTeX Strings & 3-Tier Hints: Verified');

// 10. Verify LaTeX & Markdown HTML Parser + Embedded WebView JS Script Syntax
const normalizedDelims = normalizeMathDelimiters('Inline \\(a_1^2\\) and block \\[\\frac{x_1}{x_2}\\]');
assert.ok(normalizedDelims.includes('$a_1^2$') && normalizedDelims.includes('$$\\frac{x_1}{x_2}$$'));
const sampleBodyHtml = markdownAndLatexToBodyHtml(
  '### Heading\n\n$x_1 + y_2 = z_3$\n\n$$\n\\frac{\\sin^4 x}{\\sin^4 x + \\cos^4 x}\n$$\n\n<script>alert(1)</script>',
  '#F97316'
);
assert.ok(sampleBodyHtml.includes('class="math-inline"'), 'Inline math token preserved');
assert.ok(sampleBodyHtml.includes('class="math-display"'), 'Display math token preserved');
assert.equal(sampleBodyHtml.includes('<em>'), false, 'Math underscores must not turn into <em>');
assert.equal(sampleBodyHtml.includes('<script>alert(1)'), false, 'Raw script tags must be escaped');

const fullDocHtml = buildKatexDocumentHtml({
  bodyHtml: sampleBodyHtml,
  textColor: '#F9FAFB',
  accentColor: '#F97316',
  mutedColor: '#94A3B8',
  surfaceBg: 'rgba(30,41,59,0.72)',
  borderColor: '#1E293B',
  fontSize: 15,
  lineHeight: 22,
});
const scriptMatch = fullDocHtml.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert.ok(scriptMatch && scriptMatch[1], 'WebView document must include inline fallback & height script');
// Compile script using vm.Script to prove zero JS syntax errors inside HTML template
new vm.Script(scriptMatch[1]);
console.log('✅ 10. LaTeX Markdown Pipeline, XSS Escaping & WebView Script Syntax: Verified');

// 11. Verify Bundled Audio SFX Files (including click.mp3) & Environment Isolation
const audioDir = path.resolve('assets/audio');
const requiredSfx = [
  'click.mp3',
  'correct-answer.mp3',
  'wrong-answer.mp3',
  'test-complete.mp3',
  'notification.mp3',
  'calling.mp3',
];
for (const file of requiredSfx) {
  const fullPath = path.join(audioDir, file);
  assert.ok(fs.existsSync(fullPath), `Missing SFX file: ${file}`);
  assert.ok(fs.statSync(fullPath).size > 1000, `SFX file ${file} unexpectedly small/empty`);
}
const soundMgrSrc = fs.readFileSync(path.resolve('src/services/soundManager.ts'), 'utf8');
assert.ok(soundMgrSrc.includes("click: 'click.mp3'"), 'soundManager must map click SFX');
assert.ok(soundMgrSrc.includes('playClick()'), 'soundManager must expose playClick()');

const storageSrc = fs.readFileSync(path.resolve('src/services/storage.ts'), 'utf8');
assert.ok(storageSrc.includes('clickSound: true'), 'DEFAULT_SETTINGS must enable clickSound by default');
assert.ok(
  storageSrc.includes('DEFAULT_QUESTION_VIEW_SETTINGS') && storageSrc.includes('DEFAULT_DAILY_GOAL'),
  'Storage service must define default QuestionViewSettings and DailyGoalConfig'
);

const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
assert.ok(/^\.env$/m.test(gitignore), '.gitignore must ignore .env');
console.log('✅ 11. Downloaded Audio SFX Bundle (incl. click.mp3) & .env Security: Verified');

// 12. Verify Daily Goal Streak, Monthly Heatmap, History & Difficulty Analytics
const refDate = new Date(2026, 10, 9, 21, 0, 0); // Mon Nov 9, 2026 at 21:00
const seedLogs = buildSeedAttemptLogs(refDate);
assert.ok(seedLogs.length >= 25, 'Seed logs should populate trailing history');
const dailyMap = aggregateDailyActivity(seedLogs);
const todayKey = formatLocalDateKey(refDate);
assert.equal(dailyMap[todayKey].questionsSolved, 2, 'Seed logs should have 2 solved today');

const streakInfo = computeStreakAndWeek(dailyMap, 5, refDate, 14);
assert.equal(streakInfo.weekDays.length, 7, 'Mon-Sun week strip must have 7 days');
assert.equal(streakInfo.weekDays[0].dayShort, 'Mon', 'Week starts on Monday');
assert.equal(streakInfo.weekDays[6].dayShort, 'Sun', 'Week ends on Sunday');
assert.ok(streakInfo.currentStreakDays >= 14, 'Streak integrates baseline & recent logs');

const heatmapWeeks = getMonthHeatmapWeeks(2026, 10, dailyMap, 5, refDate);
assert.ok(heatmapWeeks.length >= 4 && heatmapWeeks.every((w) => w.length === 7), 'Heatmap rows must be 7 days wide');

const weekHist = computeHistorySummary(seedLogs, 'week', 'all', refDate);
const monthHist = computeHistorySummary(seedLogs, 'month', 'all', refDate);
const physHist = computeHistorySummary(seedLogs, 'month', 'physics', refDate);
assert.ok(monthHist.qsSolved >= weekHist.qsSolved, '30-day Qs >= 7-day Qs');
assert.ok(physHist.qsSolved > 0 && physHist.qsSolved < monthHist.qsSolved, 'Subject filter narrows count');

const diffRows = computeDifficultyBreakdown(seedLogs);
assert.deepEqual(
  diffRows.map((d) => d.difficulty),
  ['Easy', 'Medium', 'Hard'],
  'Difficulty breakdown covers Easy, Medium, Hard'
);
assert.ok(diffRows.every((d) => d.attempted > 0), 'Each difficulty has sample logs');
const latestMap = getLatestQuestionStatusMap(seedLogs);
assert.ok(Object.keys(latestMap).length >= 5, 'Latest status map indexes attempted questions');
console.log('✅ 12. Daily Goal Streak, Contribution Heatmap & Difficulty Engine: Verified');

// 13. Verify 7-Day Weekly Leaderboard, League Tiers & Daily Score Reminder
const lbWeek = build7DayLeaderboard(
  seedLogs,
  { id: 'usr_local_01', name: 'Aarav Sharma', ioId: 'STUDY-7734-IO', studyStreakDays: 14 },
  'week',
  refDate
);
assert.ok(lbWeek.entries.length >= 10, 'Leaderboard ranks user alongside cohort');
assert.ok(lbWeek.currentUserEntry.isCurrentUser, 'Current user flagged in leaderboard');
assert.ok(lbWeek.currentUserEntry.weeklyXp > 0, 'User 7-day XP calculated from trailing 7 days');
for (let i = 1; i < lbWeek.entries.length; i++) {
  assert.ok(
    lbWeek.entries[i - 1].weeklyXp >= lbWeek.entries[i].weeklyXp,
    'Weekly leaderboard sorted descending by weeklyXp'
  );
}
assert.equal(resolveLeagueTier(700).currentTier.id, 'silver', '700 XP unlocks Silver Pulse');
assert.equal(resolveLeagueTier(3200).nextTier, null, '3200 XP reaches peak Diamond tier');

const activeReminder = evaluateScoreReminder(
  {
    targetQuestions: 10,
    reminderEnabled: true,
    reminderTime: '20:00',
    scoreAlertsEnabled: true,
    pushNotifications: true,
    emailNotifications: false,
  },
  2,
  14,
  refDate
);
assert.equal(activeReminder.shouldShow, true, 'Score reminder shows when unmet');
assert.equal(activeReminder.isPastReminderTime, true, '21:00 is past 20:00 reminder time');
assert.equal(activeReminder.remainingQuestions, 8, '10 - 2 = 8 remaining');

const completedReminder = evaluateScoreReminder(
  {
    targetQuestions: 10,
    reminderEnabled: true,
    reminderTime: '20:00',
    scoreAlertsEnabled: true,
    pushNotifications: true,
    emailNotifications: false,
  },
  10,
  15,
  refDate
);
assert.equal(completedReminder.shouldShow, false, 'Score reminder hides once daily target reached');
assert.equal(completedReminder.isGoalMet, true, 'Goal marked complete when target met');

const snoozedReminder = evaluateScoreReminder(
  {
    targetQuestions: 10,
    reminderEnabled: true,
    reminderTime: '20:00',
    scoreAlertsEnabled: true,
    pushNotifications: true,
    emailNotifications: false,
    lastReminderDismissedDate: todayKey,
  },
  2,
  14,
  refDate
);
assert.equal(snoozedReminder.shouldShow, false, 'Snoozed reminder stays dismissed for today');
console.log('✅ 13. 7-Day Weekly Leaderboard, League Tiers & Daily Score Reminder: Verified');

// 14. Verify My Practice Note Plain-Text -> KaTeX LaTeX Converter & Idempotency
const rollingConverted = convertPlainTextToLatex(
  'Shortcut: For any rolling body with I = kMR², acceleration down incline is (g sin θ)/(1 + k).'
);
assert.ok(
  rollingConverted.includes('\\frac{g \\sin \\theta}{1 + k}'),
  `Expected fraction TeX in: ${rollingConverted}`
);
assert.ok(
  rollingConverted.includes('I = kMR^2') && rollingConverted.includes('$'),
  `Expected equation wrapped in $...$ in: ${rollingConverted}`
);
const geomConverted = convertPlainTextToLatex(
  'Circle equation x^2 + y^2 = r^2 and distance sqrt(a^2 + b^2)'
);
assert.ok(geomConverted.includes('$x^2 + y^2 = r^2$'), 'Simple algebraic equation wrapped in $...$');
assert.ok(geomConverted.includes('\\sqrt{a^2 + b^2}'), 'sqrt() converted to \\sqrt{}');
const chemConverted = convertPlainTextToLatex('Combustion produces CO2 and H2O.');
assert.ok(chemConverted.includes('\\text{CO}_2') && chemConverted.includes('\\text{H}_2\\text{O}'), 'Chemical formulas converted');
assert.equal(
  convertPlainTextToLatex(rollingConverted),
  rollingConverted,
  'convertPlainTextToLatex must be idempotent on already-delimited LaTeX'
);
console.log('✅ 14. Practice Note LaTeX Converter & Idempotency: Verified');

// 15. Verify Custom Test Maker Builder Filtering (No Default All-Selected)
assert.equal(
  filterCustomQuestions(SAMPLE_QUESTIONS, {
    subjectIds: [],
    difficulties: ['Easy'],
    statusFilter: 'all',
    limit: 5,
  }).length,
  0,
  'Empty subject selection must return 0 matches'
);
assert.equal(
  filterCustomQuestions(SAMPLE_QUESTIONS, {
    subjectIds: ['physics'],
    difficulties: [],
    statusFilter: 'all',
    limit: 5,
  }).length,
  0,
  'Empty difficulty selection must return 0 matches'
);
const physicsOnly = filterCustomQuestions(SAMPLE_QUESTIONS, {
  subjectIds: ['physics'],
  difficulties: ['Easy', 'Medium', 'Hard'],
  statusFilter: 'all',
  limit: 5,
});
assert.ok(
  physicsOnly.length > 0 &&
    physicsOnly.length <= 5 &&
    physicsOnly.every((q) => q.subjectId === 'physics'),
  'Physics filter returns <= limit questions exclusively in Physics'
);
const fakePrior = {
  [SAMPLE_QUESTIONS[0].id]: {
    questionId: SAMPLE_QUESTIONS[0].id,
    subjectId: SAMPLE_QUESTIONS[0].subjectId,
    chapterId: SAMPLE_QUESTIONS[0].chapterId,
    difficulty: SAMPLE_QUESTIONS[0].difficulty,
    isCorrect: false,
    timeSpentSeconds: 30,
    attemptedAt: new Date().toISOString(),
  },
};
const mistakesOnly = filterCustomQuestions(
  SAMPLE_QUESTIONS,
  {
    subjectIds: [SAMPLE_QUESTIONS[0].subjectId],
    difficulties: [SAMPLE_QUESTIONS[0].difficulty],
    statusFilter: 'mistakes',
    limit: 'all',
  },
  fakePrior
);
assert.equal(mistakesOnly.length, 1, 'Mistakes filter returns only missed questions matching filters');
assert.equal(mistakesOnly[0].id, SAMPLE_QUESTIONS[0].id);
console.log('✅ 15. Custom Test Builder Filtering & Empty-Selection Guard: Verified');

// 16. Verify Dark Theme Contrast Tokens, Scoped MCQ Click SFX & Clean Error UI
const darkColors = getThemeColors('dark');
assert.notEqual(darkColors.borderSubtle, darkColors.surface, 'Dark subtle borders must differ from surface bg');
assert.notEqual(darkColors.border, darkColors.card, 'Dark borders must differ from card bg');
assert.notEqual(darkColors.inputBg, darkColors.card, 'Dark input bg must differ from card bg');

const buttonSrc = fs.readFileSync(path.resolve('src/components/common/Button.tsx'), 'utf8');
assert.ok(buttonSrc.includes('clickSfx = false'), 'Global Button must default clickSfx to false');

const offlineTrackerSrc = fs.readFileSync(path.resolve('src/screens/OfflineTrackerScreen.tsx'), 'utf8');
assert.equal(/\balert\s*\(/.test(offlineTrackerSrc), false, 'OfflineTrackerScreen must not use white native alert()');

for (const nonMcqScreen of [
  'src/components/common/Header.tsx',
  'src/components/navigation/BottomNav.tsx',
  'src/screens/DashboardScreen.tsx',
  'src/screens/AcademicToolsScreen.tsx',
  'src/screens/AIAssistantScreen.tsx',
  'src/screens/StudyMaterialScreen.tsx',
  'src/screens/ProfileScreen.tsx',
]) {
  const src = fs.readFileSync(path.resolve(nonMcqScreen), 'utf8');
  assert.equal(src.includes('SoundManager.playClick'), false, `${nonMcqScreen} must not call SoundManager.playClick`);
}

const testEngineSrc = fs.readFileSync(path.resolve('src/screens/TestEngineScreen.tsx'), 'utf8');
assert.ok(testEngineSrc.includes('useState<SubjectId[]>([])'), 'Custom subjects must start empty (unselected)');
assert.ok(testEngineSrc.includes('useState<QuestionDifficulty[]>([])'), 'Custom difficulties must start empty (unselected)');
assert.ok(testEngineSrc.includes('convertPlainTextToLatex'), 'TestEngineScreen must wire Convert to LaTeX for notes');
console.log('✅ 16. Dark Mode Contrast, Scoped MCQ Click SFX & Builder Source Hygiene: Verified');

console.log('\n🎉 ALL 16 STUDY LABS DOMAIN, LATEX, SFX, LEADERBOARD & BUILDER TESTS PASSED!');
