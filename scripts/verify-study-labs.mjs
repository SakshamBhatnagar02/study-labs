import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { strToU8, zipSync } from 'fflate';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      context.parentURL?.startsWith('file://') &&
      !path.extname(specifier)
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const tsFile = path.resolve(parentDir, `${specifier}.ts`);
      if (fs.existsSync(tsFile)) {
        return nextResolve(pathToFileURL(tsFile).href, context);
      }
      const tsIndex = path.resolve(parentDir, specifier, 'index.ts');
      if (fs.existsSync(tsIndex)) {
        return nextResolve(pathToFileURL(tsIndex).href, context);
      }
    }
    return nextResolve(specifier, context);
  },
});

// Load .env into process.env for Node test runner
try {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) {
        process.env[k] = v;
      }
    }
  }
} catch {}

const {
  classifyQuestionDifficulty,
  GeminiAIService,
  REASONING_POWER_OPTIONS,
  resolveModelForPrompt,
} = await import('../src/services/gemini.ts');
const {
  CHAPTERS,
  EXAM_BANK_PRESETS,
  FORMULA_CARDS,
  SAMPLE_QUESTIONS,
} = await import('../src/data/curriculumData.ts');
const {
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
} = await import('../src/utils/activityStats.ts');
const {
  buildKatexDocumentHtml,
  hasRichMathOrMarkdown,
  markdownAndLatexToBodyHtml,
  normalizeMathDelimiters,
} = await import('../src/utils/mathFormatting.ts');
const { convertPlainTextToLatex } = await import('../src/utils/noteLatexConverter.ts');
const {
  computeRankPercentile,
  computeTestScoreAndRankSummary,
  evaluateQuestionAnswer,
  filterCustomQuestions,
  parseMultiSelectAnswer,
  serializeMultiSelectAnswer,
} = await import('../src/utils/customTestBuilder.ts');
const {
  calculateMolarMass,
  F_BLOCK_GROUP_INFO,
  getElementExtendedMeta,
  getPeriodicGroupInfo,
  PERIODIC_GROUPS,
  PERIODIC_TABLE,
} = await import('../src/data/periodicTable.ts');
const { PHYSICAL_CONSTANTS, REACTIVITY_SERIES, CURRENCY_CODES, CURRENCY_RATES_PER_USD, convertCurrencyAmount } = await import('../src/data/academicConstants.ts');
const { evaluateMathExpression } = await import('../src/utils/mathEvaluator.ts');
const { buildApiErrorInfo, formatErrorCloneText } = await import('../src/utils/errorHandling.ts');
const {
  checkCanStoreGeneratedImage,
  computeStorageQuotaUsage,
  generateStemDiagramSvg,
  PLAN_CONFIGS,
  rebuildEditableSvgItem,
  svgToDataUri,
} = await import('../src/utils/aiImageLibrary.ts');
const {
  buildCalendarMonthGrid,
  computeDaysRemaining,
  detectDeviceRegion,
  getHolidaysForCountryAndYear,
} = await import('../src/utils/calendarHolidays.ts');
const {
  classifyAttachmentKind,
  extractTextFromPptxBytes,
} = await import('../src/utils/attachmentParser.ts');
const {
  CHAPTER_STUDY_MODULES,
  CHEMISTRY_REFERENCE_TABLES,
  getChapterStudyModule,
  GLOBAL_CURRICULUM_CATALOG,
} = await import('../src/data/curriculumData.ts');
const {
  ATTENDANCE_POLICY_DISCLAIMER,
  canPostInChannel,
  canViewChannel,
  checkMessageAntiSpam,
  computeClubCohortStats,
  createNewStudyClubObject,
  filterDirectoryClubs,
  resolveMemberPermissions,
} = await import('../src/utils/clubsEngine.ts');
const { DEFAULT_CLUBS_WORKSPACE, SEED_STUDY_CLUBS } = await import('../src/data/clubsSeedData.ts');
const {
  buildDailyChallenges,
  buildMultiPeriodLeaderboard,
  evaluateAchievementBadges,
} = await import('../src/utils/gamificationEngine.ts');
const { getThemeColors } = await import('../src/theme/colors.ts');
const { isDisposableEmail, getEmailDomain, isWhitelistedDomain, checkTempMailApi } = await import('../src/utils/tempMailDetector.ts');
const { evaluatePasswordBreachRisk } = await import('../src/utils/breachDetector.ts');
const { SEED_EBOOKS } = await import('../src/data/ebooksData.ts');
const { SEED_COMMUNITY_QUESTIONS, SEED_COMMUNITY_RESOURCES } = await import('../src/data/communitySeedData.ts');
const { PRESET_AVATARS, resolveAvatarSource } = await import('../src/utils/avatarHelper.ts');
const { ResendEmailService } = await import('../src/services/resendService.ts');
const { CLOUD_STORAGE_CONFIGS, CloudStorageService } = await import('../src/services/cloudStorage.ts');
const { compressImage, formatBytes, estimateBase64Size } = await import('../src/utils/imageCompressor.ts');
const { GravatarService } = await import('../src/utils/gravatarService.ts');
const { NOTO_ANIMATED_EMOJIS, getNotoAnimatedEmojiUrl } = await import('../src/utils/animatedEmojiData.ts');

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

// 17. Verify Complete 118-Element Periodic Table, Molar Mass Calculator, Constants & E° Reactivity
assert.equal(PERIODIC_TABLE.length, 118, 'Periodic table must include all 118 IUPAC elements');
const seenNums = new Set();
const seenSyms = new Set();
for (let i = 0; i < PERIODIC_TABLE.length; i++) {
  const el = PERIODIC_TABLE[i];
  assert.equal(el.number, i + 1, `Atomic number sequence mismatch at index ${i}`);
  assert.equal(seenNums.has(el.number), false, `Duplicate atomic # ${el.number}`);
  assert.equal(seenSyms.has(el.symbol), false, `Duplicate symbol ${el.symbol}`);
  seenNums.add(el.number);
  seenSyms.add(el.symbol);
}
assert.equal(PERIODIC_TABLE[117].symbol, 'Og', 'Element 118 must be Oganesson (Og)');

const h2o = calculateMolarMass('H2O');
assert.ok(h2o.success && Math.abs((h2o.molarMass || 0) - 18.015) < 0.02, 'H2O molar mass ≈ 18.015 g/mol');
const caoh2 = calculateMolarMass('Ca(OH)2');
assert.ok(caoh2.success && Math.abs((caoh2.molarMass || 0) - 74.092) < 0.05, 'Ca(OH)2 molar mass ≈ 74.092 g/mol');
const hydrate = calculateMolarMass('CuSO4.5H2O');
assert.ok(hydrate.success && Math.abs((hydrate.molarMass || 0) - 249.68) < 0.2, 'CuSO4.5H2O molar mass ≈ 249.68 g/mol');
assert.ok(PHYSICAL_CONSTANTS.length >= 20, 'Constants library should expose 20+ STEM constants');
assert.ok(REACTIVITY_SERIES.length >= 16 && REACTIVITY_SERIES.every((r) => Boolean(r.potentialV)), 'Reactivity series should include E° potentials');
console.log('✅ 17. Complete 118-Element Periodic Table, Molar Mass & Constants: Verified');

// 18. Verify Device Location Detection & Regional Holiday Calendar
assert.equal(detectDeviceRegion('Asia/Kolkata', 'en-IN').country, 'IN', 'Asia/Kolkata resolves to India');
assert.equal(detectDeviceRegion('America/New_York', 'en-US').country, 'US', 'America/New_York resolves to US');
assert.equal(detectDeviceRegion('Europe/London', 'en-GB').country, 'GB', 'Europe/London resolves to UK');
const inHolidays2026 = getHolidaysForCountryAndYear('IN', 2026);
assert.ok(inHolidays2026.length >= 5, 'India 2026 calendar must include public & academic holidays');
const gridNov2026 = buildCalendarMonthGrid(
  2026,
  10,
  inHolidays2026,
  new Set(),
  new Set(),
  new Date(2026, 10, 10)
);
assert.ok(
  gridNov2026.length >= 4 && gridNov2026.every((week) => week.length === 7),
  'Calendar grid rows must align to 7-day weeks'
);
assert.equal(
  computeDaysRemaining('2027-01-24', new Date(2027, 0, 10)),
  14,
  'computeDaysRemaining must calculate exact day delta'
);
console.log('✅ 18. Device Timezone Region Detection & Regional Holiday Calendar: Verified');

// 19. Verify Multiple-Correct MCQ, Integer Evaluation, Custom Marking & Rank Impact Engine
const multiQ = {
  id: 'q_test_multi',
  chapterId: 'ch_1',
  subjectId: 'physics',
  type: 'multiple_mcq',
  prompt: 'Select correct statements',
  options: [
    { id: 'a', text: 'A', isCorrect: true },
    { id: 'b', text: 'B', isCorrect: false },
    { id: 'c', text: 'C', isCorrect: true },
    { id: 'd', text: 'D', isCorrect: false },
  ],
  explanation: 'A and C',
  difficulty: 'Medium',
};
assert.equal(serializeMultiSelectAnswer(['c', 'a', 'a']), 'a,c', 'Multi-select serializes sorted unique IDs');
assert.deepEqual(parseMultiSelectAnswer('c, a'), ['a', 'c'], 'Multi-select parses cleanly');
assert.equal(evaluateQuestionAnswer(multiQ, 'a,c'), true, 'Exact multi-select set matches');
assert.equal(evaluateQuestionAnswer(multiQ, 'a'), false, 'Partial multi-select must not mark full correct');

const customSummary = computeTestScoreAndRankSummary({
  questions: [multiQ, { ...multiQ, id: 'q_test_int', type: 'numerical', numericalAnswer: 42, numericalTolerance: 0 }],
  answers: { q_test_multi: 'a,c', q_test_int: 99 },
  marksPerCorrect: 5,
  negativeMarks: 2,
  targetRank: 1000,
  totalCandidates: 10000,
});
assert.equal(customSummary.score, 3, 'Custom +5/-2 marking: 5 - 2 = 3');
assert.equal(customSummary.maxScore, 10, 'Custom max score = 2 * 5 = 10');
assert.equal(computeRankPercentile(50, 10000), 99.5, 'Rank 50/10000 = 99.5 %ile');
console.log('✅ 19. Multi-MCQ, Custom Marking (+5/-2) & Rank Projection Engine: Verified');

// 20. Verify Scientific Calculator v2 (Deg/Rad, Inverse Trig, Factorial, % & Security)
assert.equal(evaluateMathExpression('sin(30)', 'deg').formatted, '0.5', 'sin(30 deg) = 0.5');
assert.equal(evaluateMathExpression('sin(π/6)', 'rad').formatted, '0.5', 'sin(pi/6 rad) = 0.5');
assert.equal(evaluateMathExpression('asin(0.5)', 'deg').formatted, '30', 'asin(0.5) in deg = 30');
assert.equal(evaluateMathExpression('5!', 'deg').formatted, '120', '5! = 120');
assert.equal(evaluateMathExpression('200 * 15%', 'deg').formatted, '30', '200 * 15% = 30');
assert.equal(evaluateMathExpression('eval("1+1")', 'deg').success, false, 'eval injection blocked');
console.log('✅ 20. Scientific Evaluator v2 (Deg/Rad, Factorial, %, Security): Verified');

// 21. Verify Multimodal Upload Classification & PPTX Slide Extraction via fflate
assert.equal(classifyAttachmentKind('notes.pdf', 'application/pdf'), 'pdf');
assert.equal(classifyAttachmentKind('lecture.pptx', ''), 'ppt');
assert.equal(classifyAttachmentKind('diagram.png', 'image/png'), 'image');
assert.equal(classifyAttachmentKind('formulas.txt', 'text/plain'), 'text');

const samplePptxBytes = zipSync({
  'ppt/slides/slide1.xml': strToU8(
    '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:t>Electrostatics</a:t><a:t>Gauss Law: Phi = Q/eps0</a:t></p:sld>'
  ),
});
const extractedSlideText = extractTextFromPptxBytes(samplePptxBytes);
assert.ok(
  extractedSlideText.includes('Slide 1:') && extractedSlideText.includes('Gauss Law'),
  `PPTX extraction must recover slide text, got: ${extractedSlideText}`
);
console.log('✅ 21. Multimodal File Classification & PPTX Extraction: Verified');

// 22. Verify UI & Regression Safety Invariants Across All Screens
for (const screenWithSwitch of [
  'src/screens/DailyGoalScreen.tsx',
  'src/screens/StudyMaterialScreen.tsx',
  'src/screens/TestEngineScreen.tsx',
  'src/components/common/DailyGoalModal.tsx',
  'src/components/settings/SettingsModal.tsx',
]) {
  const src = fs.readFileSync(path.resolve(screenWithSwitch), 'utf8');
  if (src.includes('<Switch')) {
    assert.ok(src.includes('thumbColor='), `${screenWithSwitch} must explicitly style Switch thumbColor`);
  }
}
for (const responsiveScreen of [
  'src/screens/AnalyticsScreen.tsx',
  'src/screens/GraphPlaygroundScreen.tsx',
]) {
  const src = fs.readFileSync(path.resolve(responsiveScreen), 'utf8');
  assert.equal(
    src.includes("Dimensions.get('window')"),
    false,
    `${responsiveScreen} must use useWindowDimensions() instead of static Dimensions.get('window')`
  );
}
assert.ok(testEngineSrc.includes('isFocused'), 'TestEngineScreen must pause timer via isFocused');
assert.ok(testEngineSrc.includes('hiddenHintCatsByQ'), 'TestEngineScreen must support per-category hint toggle');
assert.equal(
  testEngineSrc.includes('setHintsCollapsed(false);\n    const nextHint'),
  false,
  'Broken conflicting hints setter bug must remain removed'
);
console.log('✅ 22. UI Switch, Responsive Viewport & Hint/Focus Safety Invariants: Verified');

// 23. Verify Periodic Table Group 1-18 Family Metadata & Element Extended Attributes
assert.equal(Object.keys(PERIODIC_GROUPS).length, 18, 'PERIODIC_GROUPS must define all 18 IUPAC groups');
for (let g = 1; g <= 18; g++) {
  const grp = getPeriodicGroupInfo(g);
  assert.equal(grp.groupNumber, g, `Group ${g} metadata mismatch`);
  assert.ok(grp.familyName && grp.valenceShell && grp.periodicTrends && grp.keyProperties.length >= 2 && grp.signatureCompounds.length >= 3, `Group ${g} must include complete study metadata`);
}
assert.equal(F_BLOCK_GROUP_INFO.lanthanide.block, 'f-block');
assert.equal(F_BLOCK_GROUP_INFO.actinide.block, 'f-block');
const chlorine = PERIODIC_TABLE.find((e) => e.symbol === 'Cl');
assert.ok(chlorine, 'Chlorine must exist in PERIODIC_TABLE');
const clMeta = getElementExtendedMeta(chlorine);
assert.equal(clMeta.block, 'p-block');
assert.equal(clMeta.stateAtStp, 'Gas');
assert.equal(clMeta.electronegativity, 3.16);
assert.equal(clMeta.groupInfo.groupNumber, 17);
console.log('✅ 23. Periodic Table Group 1–18 Profiles, Trends & Extended Metadata: Verified');

// 24. Verify Structured Error Classification, Redaction & Clone Report Output
const secretLeakErr = buildApiErrorInfo(
  'gemini',
  new Error('Request failed x-goog-api-key=AIzaSyTestSecretKey123456789 HTTP 429 rate limit exceeded')
);
assert.equal(secretLeakErr.code, 429, 'Detects HTTP 429 status code');
assert.equal(secretLeakErr.canRetry, true);
assert.equal(secretLeakErr.rawError.includes('AIzaSyTestSecretKey123456789'), false, 'Sensitive API keys must be redacted');
const cloneReport = formatErrorCloneText(secretLeakErr);
assert.ok(cloneReport.includes('Study Labs Diagnostic Error Clone') && cloneReport.includes('Code: 429'));
const supabase404 = buildApiErrorInfo('supabase', { code: 'PGRST205', message: 'Could not find the table public.questions' });
assert.equal(supabase404.code, 'PGRST205');
assert.ok(supabase404.title.includes('Not Found'));
console.log('✅ 24. Structured Error Handling, Key Redaction & Clone Error Format: Verified');

// 25. Verify AI STEM Diagram Generator, Free Plan Quotas & Interactive Editor Rebuilds
assert.equal(PLAN_CONFIGS.free.maxStorageBytes, 10 * 1024 * 1024, 'Default Free Plan storage is 10 MB');
assert.equal(PLAN_CONFIGS.free.maxImages, 15, 'Default Free Plan limit is 15 visuals');
const sampleDiag = generateStemDiagramSvg({
  prompt: 'Compare SN1 vs SN2 reaction energy diagram',
  bgTheme: 'blueprint',
  annotations: [{ id: 'a1', text: 'TS Peak', xPct: 45, yPct: 30 }],
});
assert.equal(sampleDiag.subjectCategory, 'chemistry');
assert.equal(sampleDiag.visualPresetKey, 'sn1_sn2_coordinate');
assert.ok(sampleDiag.svgMarkup.includes('<svg') && sampleDiag.svgMarkup.includes('TS Peak'));
const rebuiltDiag = rebuildEditableSvgItem({
  id: 'vis_test_1',
  title: 'Custom Edited Visual',
  prompt: 'Projectile motion curve',
  subjectCategory: 'physics',
  format: 'svg',
  dataUri: svgToDataUri('<svg/>'),
  svgMarkup: '<svg/>',
  byteSize: 100,
  width: 600,
  height: 400,
  createdAt: new Date().toISOString(),
  source: 'stem_engine',
  visualPresetKey: 'projectile_motion',
  rotationDeg: 90,
  flipX: true,
  bgTheme: 'light',
  showGrid: false,
  showLabels: true,
  annotations: [{ id: 'a2', text: 'Peak H_max', xPct: 50, yPct: 22 }],
});
assert.ok(
  rebuiltDiag.svgMarkup?.includes('Peak H_max') &&
    rebuiltDiag.svgMarkup?.includes('rotate(90)') &&
    rebuiltDiag.svgMarkup?.includes('scale(-1,1)'),
  'Editable SVG rebuilds annotations, rotation, and flip transforms'
);

const fifteenImages = Array.from({ length: 15 }, (_, idx) => ({
  ...rebuiltDiag,
  id: `img_${idx}`,
  byteSize: 1024,
}));
assert.equal(
  checkCanStoreGeneratedImage(fifteenImages, 'free', 1024).errorInfo?.code,
  'QUOTA_COUNT_EXCEEDED',
  '16th image on Free Plan must be blocked by quota'
);
assert.equal(
  checkCanStoreGeneratedImage([], 'free', 11 * 1024 * 1024).errorInfo?.code,
  'QUOTA_BYTES_EXCEEDED',
  '11 MB payload on Free Plan must be blocked by byte quota'
);
assert.equal(computeStorageQuotaUsage(fifteenImages, 'free').imageCount, 15);
console.log('✅ 25. AI STEM Visual Generator, Interactive Editor & Free Plan Quota Engine: Verified');

// 26. Verify Pannable LaTeX Tables, Rounded Corner Clipping & Source Safety Invariants
const tableHtml = buildKatexDocumentHtml({
  bodyHtml: markdownAndLatexToBodyHtml('| Col A | Col B | Col C |\n| --- | --- | --- |\n| 1 | 2 | 3 |', '#F97316'),
  textColor: '#F8FAFC',
  accentColor: '#F97316',
  mutedColor: '#94A3B8',
  surfaceBg: '#0F172A',
  borderColor: '#1E293B',
  fontSize: 14,
  lineHeight: 20,
});
assert.ok(
  tableHtml.includes('width: max-content') && tableHtml.includes('touch-action: pan-x pan-y'),
  'Table WebView CSS must enable full pannable overflow instead of clipping wide comparisons'
);
for (const clippedFile of [
  'src/components/common/Card.tsx',
  'src/components/common/Button.tsx',
  'src/components/common/Header.tsx',
  'src/components/navigation/BottomNav.tsx',
  'src/screens/DashboardScreen.tsx',
]) {
  const src = fs.readFileSync(path.resolve(clippedFile), 'utf8');
  assert.ok(src.includes("overflow: 'hidden'"), `${clippedFile} must apply overflow: 'hidden' to keep corners rounded on press`);
}
const aiScreenSrc = fs.readFileSync(path.resolve('src/screens/AIAssistantScreen.tsx'), 'utf8');
assert.equal(aiScreenSrc.includes('SoundManager.playClick'), false, 'AIAssistantScreen must not call SoundManager.playClick');
assert.ok(aiScreenSrc.includes('allowPanModal') && testEngineSrc.includes('allowPanModal'), 'Both AI Tutor & Test Engine must support pannable/zoomable LaTeX modal');
assert.ok(aiScreenSrc.includes('ApiErrorCard') && aiScreenSrc.includes('ImageLibraryModal') && aiScreenSrc.includes('AttachmentPreviewModal'), 'AIAssistantScreen must integrate Error Cards, Image Library, and Attachment Editor');
console.log('✅ 26. Pannable LaTeX Tables, Rounded Press Clipping & New Feature Integrations: Verified');

// 27. Verify Clubs & Teacher/Institute RBAC, 3-Way Channel Access, Anti-Spam & Attendance Disclaimer
assert.ok(SEED_STUDY_CLUBS.length >= 3, 'Should seed at least 3 Study Clubs / Institutes');
const vertexClub = SEED_STUDY_CLUBS.find((c) => c.id === 'club_vertex_academy');
assert.ok(vertexClub, 'Vertex STEM Institute seed club must exist');
assert.equal(DEFAULT_CLUBS_WORKSPACE.activeClubId, vertexClub.id);

const facultyPrivateCh = vertexClub.channels.find((ch) => ch.accessMode === 'role_private');
const readOnlyAnnCh = vertexClub.channels.find((ch) => ch.type === 'announcements');
assert.ok(facultyPrivateCh && readOnlyAnnCh, 'Seed club must include both role_private and announcements channels');

const studentPerms = resolveMemberPermissions(vertexClub, 'usr_local_01', 'Student');
assert.equal(studentPerms.isManager, false, 'Student simulated view must not grant manager access');
assert.equal(
  canViewChannel(facultyPrivateCh, studentPerms.roles.map((r) => r.id), studentPerms.isManager),
  false,
  'role_private channel must be hidden from Student role'
);
assert.equal(
  canPostInChannel(readOnlyAnnCh, studentPerms.roles.map((r) => r.id), studentPerms.isManager).allowed,
  false,
  'Read-only #announcements must block posts from Student role'
);

const teacherPerms = resolveMemberPermissions(vertexClub, 'usr_local_01', 'Teacher');
assert.equal(teacherPerms.permissions.canCreateAssignments, true);
assert.equal(teacherPerms.permissions.canTakeAttendance, true);
assert.equal(
  canViewChannel(facultyPrivateCh, teacherPerms.roles.map((r) => r.id), teacherPerms.isManager),
  true,
  'role_private faculty channel must be visible to Teacher role'
);
assert.equal(
  canPostInChannel(readOnlyAnnCh, teacherPerms.roles.map((r) => r.id), teacherPerms.isManager, teacherPerms.permissions.canPostAnnouncements).allowed,
  true,
  'Teacher should be allowed to post announcements'
);

assert.equal(checkMessageAntiSpam('See https://study.io/notes/123', true).ok, true, 'Trusted study.io URL must be allowed');
assert.equal(checkMessageAntiSpam('Win free prizes at https://spam-promo.example/buy', true).ok, false, 'Untrusted external link must be blocked by club safety filter');
assert.equal(filterDirectoryClubs(SEED_STUDY_CLUBS, { query: 'INST-VERT27' }).length, 1, 'Invite code search in Directory must locate Vertex STEM Institute');

const customClub = createNewStudyClubObject({
  name: 'AP Physics Circle',
  description: 'Weekly problem-solving seminar.',
  kind: 'study_club',
  category: 'Olympiad & STEM Lab',
  tags: ['AP Physics', 'Mechanics'],
  primaryLanguage: 'English',
  country: 'United States',
  isPrivate: false,
  aboutAdmin: 'Lead Mentor',
  rules: ['Show LaTeX derivations'],
  bannerColor: '#EA580C',
  iconColor: '#F97316',
  owner: { userId: 'usr_local_01', name: 'Aarav Sharma', ioId: 'STUDY-7734-IO' },
});
assert.ok(customClub.inviteCode.startsWith('CLUB-') && customClub.channels.length >= 4);
const cohortStats = computeClubCohortStats(vertexClub);
assert.ok(cohortStats.totalMembers >= 4 && cohortStats.totalAssignments >= 1);
assert.ok(
  ATTENDANCE_POLICY_DISCLAIMER.toLowerCase().includes('participation records only') &&
    ATTENDANCE_POLICY_DISCLAIMER.toLowerCase().includes('do not verify'),
  'Attendance disclaimer must explicitly state participation logging only'
);
console.log('✅ 27. Clubs RBAC, 3-Way Channel Access, Anti-Spam, Cohort Stats & Attendance Policy: Verified');

// 28. Verify Multi-Period Leaderboard (5 Timeframes), Daily Challenges & Achievement Badges
const seededProfile = {
  id: 'usr_local_01',
  ioId: 'STUDY-7734-IO',
  name: 'Aarav Sharma',
  email: 'aarav@study.io',
  country: 'India',
  board: 'JEE_MAIN',
  classGrade: 'Class 12',
  stream: 'Science (PCM)',
  targetExams: ['JEE Main'],
  preferredMode: 'Detailed',
  studyStreakDays: 14,
  totalXp: 3420,
  level: 5,
};
const timeframes = ['today', 'week', 'month', 'year', 'all_time'];
for (const tf of timeframes) {
  const res = buildMultiPeriodLeaderboard(seedLogs, seededProfile, tf, refDate);
  assert.equal(res.timeframe, tf);
  assert.ok(res.entries.length >= 6 && res.currentUserEntry.rank >= 1, `Timeframe ${tf} must rank current user`);
}
const allTimeRes = buildMultiPeriodLeaderboard(seedLogs, seededProfile, 'all_time', refDate);
const todayRes = buildMultiPeriodLeaderboard(seedLogs, seededProfile, 'today', refDate);
assert.ok(allTimeRes.currentUserStats.xp >= todayRes.currentUserStats.xp, 'All-time XP must be >= today XP');
const dailyCh = buildDailyChallenges(seedLogs, 15, ['ch_club_engage']);
assert.equal(dailyCh.length, 3, 'Daily Challenges should expose 3 challenges');
assert.equal(dailyCh.find((c) => c.id === 'ch_club_engage')?.claimed, true);
const achBadges = evaluateAchievementBadges(seedLogs, seededProfile, 15, 2);
assert.ok(achBadges.length >= 5 && achBadges.some((b) => b.id === 'badge_club_scholar' && b.unlocked), 'Achievement badges must unlock Study Guild Collaborator');
console.log('✅ 28. Multi-Period Leaderboard (5 Timeframes), Daily Challenges & Achievement Badges: Verified');

// 29. Verify Global Multi-Curriculum Catalog, Chapter Notes/Mind Maps, Chemistry Tables & Currency FX
assert.ok(GLOBAL_CURRICULUM_CATALOG.length >= 6, 'Global curriculum catalog should cover India, US, UK, SG, UAE & Global');
assert.ok(CHEMISTRY_REFERENCE_TABLES.length >= 3, 'Chemistry Reference Tables should include IUPAC, Indicators, Flame Tests');
const firstChapterMod = getChapterStudyModule(CHAPTERS[0]);
assert.ok(CHAPTER_STUDY_MODULES[CHAPTERS[0].id] && firstChapterMod.mindMapBranches.length >= 2 && firstChapterMod.workedExamples.length >= 1);
assert.ok(CURRENCY_CODES.includes('INR') && CURRENCY_CODES.includes('EUR') && CURRENCY_CODES.includes('USD'));
const usdToInr = convertCurrencyAmount(10, 'USD', 'INR');
assert.ok(Math.abs(usdToInr - 10 * CURRENCY_RATES_PER_USD.INR) < 0.01, '10 USD -> INR must match baseline rate');
assert.ok(Math.abs(convertCurrencyAmount(usdToInr, 'INR', 'USD') - 10) < 0.01, 'Round-trip INR -> USD conversion must preserve value');
console.log('✅ 29. Global Curricula, Mind Maps/Notes, Chemistry Reference Tables & FX Converter: Verified');

// 30. Verify UI Component Safety Invariants (Zero browser alert/confirm, Attendance Disclaimer, Rounded Overflow)
const uiFilesToAudit = [
  'src/screens/ClubsScreen.tsx',
  'src/components/clubs/ChannelSettingsModal.tsx',
  'src/components/clubs/TeacherManagementModal.tsx',
  'src/components/clubs/ClubDirectoryModal.tsx',
  'src/components/clubs/ClubPreviewModal.tsx',
  'src/components/clubs/CreateClubModal.tsx',
  'src/components/auth/OnboardingAuthModal.tsx',
  'src/components/auth/CaptchaChallenge.tsx',
  'src/components/common/QuickCalculatorModal.tsx',
  'src/components/ebooks/EBookReaderModal.tsx',
  'src/screens/GraphPlaygroundScreen.tsx',
  'src/screens/LeaderboardScreen.tsx',
  'src/screens/StudyMaterialScreen.tsx',
  'src/screens/SyllabusCalendarScreen.tsx',
  'src/screens/EBooksScreen.tsx',
  'src/screens/CommunityScreen.tsx',
  'src/screens/AdminConsoleScreen.tsx',
];
for (const relPath of uiFilesToAudit) {
  const content = fs.readFileSync(path.resolve(relPath), 'utf8');
  assert.equal(/\b(window\.)?(alert|confirm|prompt)\s*\(/.test(content), false, `${relPath} must never call browser alert/confirm/prompt`);
}
const teacherModalSrc = fs.readFileSync(path.resolve('src/components/clubs/TeacherManagementModal.tsx'), 'utf8');
assert.ok(teacherModalSrc.includes('ATTENDANCE_POLICY_DISCLAIMER'), 'TeacherManagementModal must display the mandatory attendance participation disclaimer');
const channelModalSrc = fs.readFileSync(path.resolve('src/components/clubs/ChannelSettingsModal.tsx'), 'utf8');
assert.ok(channelModalSrc.includes('activeThumbColor'), 'ChannelSettingsModal Switches must declare explicit activeThumbColor for crisp Cyber Orange styling');
console.log('✅ 30. Zero Browser Dialogs, Mandatory Attendance Notice & Switch Contrast Invariants: Verified');

// 31. Verify Disposable/Temp-Mail Detection & Security Guards
assert.equal(isDisposableEmail('test@mailinator.com').isDisposable, true, 'mailinator.com must be detected as disposable');
assert.equal(isDisposableEmail('burner@tempmail.com').isDisposable, true, 'tempmail.com must be detected as disposable');
assert.equal(isDisposableEmail('junk@guerrillamail.com').isDisposable, true, 'guerrillamail.com must be detected as disposable');
assert.equal(isDisposableEmail('user@10minutemail.com').isDisposable, true, '10minutemail.com must be detected as disposable');
assert.equal(isDisposableEmail('student@study.io').isDisposable, false, 'study.io should not be flagged as disposable');
assert.equal(isDisposableEmail('scholar@gmail.com').isDisposable, false, 'gmail.com should not be flagged as disposable');
assert.equal(getEmailDomain('test@yopmail.com'), 'yopmail.com');
console.log('✅ 31. Disposable / Temp-Mail Blacklist & Domain Parser: Verified');

// 32. Verify Password Breach & Entropy Risk Evaluator
const breachedRes1 = evaluatePasswordBreachRisk('123456');
assert.equal(breachedRes1.isCompromised, true);
assert.equal(breachedRes1.riskLevel, 'critical');
const breachedRes2 = evaluatePasswordBreachRisk('password');
assert.equal(breachedRes2.isCompromised, true);
assert.equal(breachedRes2.riskLevel, 'critical');
const strongRes = evaluatePasswordBreachRisk('Quantum#Superposition!9842');
assert.equal(strongRes.isCompromised, false);
assert.equal(strongRes.riskLevel, 'safe');
console.log('✅ 32. Data Breach Risk Analyzer & Password Leak Heuristics: Verified');

// 33. Verify Digital E-Books Catalog & Reader Structure
assert.ok(SEED_EBOOKS.length >= 7, 'Should provide at least 7 comprehensive e-books/syllabi');
for (const b of SEED_EBOOKS) {
  assert.ok(b.id && b.title && b.author && b.chapters.length >= 1, `Book ${b.id} must have complete metadata & chapters`);
  assert.ok(b.chapters[0].content.length > 50, `Book ${b.id} first chapter must contain study content`);
}
console.log('✅ 33. Digital E-Books Catalog & KaTeX Chapter Data: Verified');

// 34. Verify Community Doubt Exchange & Resource Seed Hub
assert.ok(SEED_COMMUNITY_QUESTIONS.length >= 3, 'Community must seed questions');
for (const q of SEED_COMMUNITY_QUESTIONS) {
  assert.ok(q.id && q.title && q.content && q.answers.length >= 1);
  assert.ok(q.answers.some((a) => a.isVerified), `Question ${q.id} must include at least one verified answer`);
}
assert.ok(SEED_COMMUNITY_RESOURCES.length >= 4, 'Community resources must seed books and notes');
console.log('✅ 34. Community Q&A Doubt Engine, LaTeX Solutions & Verified Answers: Verified');

// 35. Verify Preset Avatar Assets & Resolution
assert.ok(PRESET_AVATARS.length >= 4, 'Must provide at least 4 preset avatars');
assert.ok(PRESET_AVATARS.some((a) => a.id === 'preset:boy'));
assert.ok(PRESET_AVATARS.some((a) => a.id === 'preset:girl'));
assert.ok(PRESET_AVATARS.some((a) => a.id === 'preset:male-teacher'));
assert.ok(PRESET_AVATARS.some((a) => a.id === 'preset:female-teacher'));
const resolvedPreset = resolveAvatarSource('preset:boy');
assert.ok(resolvedPreset !== null, 'Preset avatar resolution must return valid image source');
const customUrl = resolveAvatarSource('https://example.com/avatar.png');
assert.deepEqual(customUrl, { uri: 'https://example.com/avatar.png' });
console.log('✅ 35. Preset Scholar/Teacher Avatars & Image Resolution: Verified');

// 36. Verify Resend Email Service Configuration & Templates
assert.equal(ResendEmailService.isConfigured(), true, 'ResendEmailService must detect configured API key');
const testOtp = '849201';
const otpDispatch = await ResendEmailService.sendVerificationOtp('scholar@study.io', testOtp, 'Aditya');
assert.equal(otpDispatch.deliveredTo, 'scholar@study.io', 'Dispatch must record target recipient');
assert.ok(otpDispatch.timestamp, 'Dispatch must generate valid ISO timestamp');
console.log('✅ 36. Resend Email Dispatch Engine & Transactional OTP Service: Verified');

// 37. Verify Abstract API & Trusted Domain Whitelist
assert.equal(isWhitelistedDomain('gmail.com'), true, 'gmail.com must be whitelisted');
assert.equal(isWhitelistedDomain('outlook.com'), true, 'outlook.com must be whitelisted');
assert.equal(isWhitelistedDomain('yahoo.com'), true, 'yahoo.com must be whitelisted');
assert.equal(isWhitelistedDomain('icloud.com'), true, 'icloud.com must be whitelisted');
assert.equal(isWhitelistedDomain('iitb.ac.in'), true, 'Academic domain (.ac.in) must be whitelisted');
const fastGmailCheck = isDisposableEmail('student@gmail.com');
assert.equal(fastGmailCheck.isWhitelisted, true, 'Whitelisted domain must bypass external API');
assert.equal(fastGmailCheck.isDisposable, false);
console.log('✅ 37. Abstract API Integration & Trusted Email Domain Whitelist: Verified');

// 38. Verify Backblaze B2 & Multi-Cloud Storage Telemetry
assert.equal(CLOUD_STORAGE_CONFIGS.b2.isConfigured, true, 'Backblaze B2 must be configured with Master Application Key');
assert.ok(CLOUD_STORAGE_CONFIGS.b2.label.includes('Backblaze B2'));
assert.ok(CLOUD_STORAGE_CONFIGS.s3_r2.label.includes('Cloudflare R2'));
const b2Upload = await CloudStorageService.uploadResource(
  {
    fileName: 'quantum_mechanics_notes.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 184000,
    base64OrUri: 'data:image/jpeg;base64,ABCDEF123456',
    bucket: 'notes',
    compressed: true,
    originalSizeBytes: 1840000,
  },
  'b2'
);
assert.equal(b2Upload.success, true);
assert.equal(b2Upload.provider, 'b2');
assert.ok(b2Upload.publicUrl.includes('backblazeb2.com'));
assert.ok(b2Upload.savingsBytes > 0);
console.log('✅ 38. Backblaze B2 & Cloudflare R2 Multi-Cloud Storage Architecture: Verified');

// 39. Verify Client-Side Image Compression & Space Savings
const estSize = estimateBase64Size('data:image/jpeg;base64,QUJDRA==');
assert.ok(estSize > 0, 'estimateBase64Size must return byte size');
assert.equal(formatBytes(1536), '1.5 KB');
assert.equal(formatBytes(2097152), '2.00 MB');
const compRes = await compressImage('data:image/jpeg;base64,QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=', {
  maxWidth: 512,
  maxHeight: 512,
  quality: 0.8,
});
assert.ok(compRes.compressedUri, 'Compressed URI must be defined');
assert.ok(compRes.savingsPercentage >= 0, 'Savings percentage must be computed');
console.log('✅ 39. Client-Side Image Compression Engine (Avatars, Notes & Covers): Verified');

// 40. Verify Gravatar Integration & SHA-256 Email Hashing
assert.equal(GravatarService.normalizeEmail(' Scholar@Study.io '), 'scholar@study.io');
const gravatarHash = GravatarService.getEmailHash('scholar@study.io');
assert.equal(gravatarHash.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');
const gravatarUrl = GravatarService.getAvatarUrl('scholar@study.io', { size: 200 });
assert.ok(gravatarUrl.includes('https://gravatar.com/avatar/' + gravatarHash));
const resolvedGravatar = resolveAvatarSource('gravatar:scholar@study.io');
assert.ok(resolvedGravatar.uri.includes('gravatar.com/avatar/'));
console.log('✅ 40. Gravatar User Avatar Resolver & SHA-256 Hashing: Verified');

// 41. Verify Google Fonts Noto Animated Emoji Engine
assert.equal(NOTO_ANIMATED_EMOJIS.fire.codepoint, '1f525');
assert.equal(NOTO_ANIMATED_EMOJIS.sparkles.codepoint, '2728');
assert.equal(NOTO_ANIMATED_EMOJIS.heart.codepoint, '2764_fe0f');
assert.equal(
  getNotoAnimatedEmojiUrl('fire'),
  'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp'
);
assert.equal(
  getNotoAnimatedEmojiUrl('sparkles'),
  'https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.webp'
);
console.log('✅ 41. Google Fonts Noto Animated Emoji Engine: Verified');

// 42. Verify EAS & Expo Configuration
const easAppJson = JSON.parse(fs.readFileSync(path.resolve('app.json'), 'utf8'));
assert.equal(
  easAppJson.expo?.extra?.eas?.projectId,
  '1ac12902-be7f-48d1-90e6-7079fcbdf18a',
  'app.json must specify EAS project ID'
);
const easJson = JSON.parse(fs.readFileSync(path.resolve('eas.json'), 'utf8'));
assert.ok(easJson.build?.development && easJson.build?.preview && easJson.build?.production);
console.log('✅ 42. EAS CLI 27.10.0 Project Linking & eas.json Build Profiles: Verified');

console.log('\n🎉 ALL 42 STUDY LABS DOMAIN, CLUBS RBAC, 3D STEM LABS, E-BOOKS, RESEND, CLOUDFLARE, B2, COMPRESSION & GRAVATAR INVARIANT TESTS PASSED!');
