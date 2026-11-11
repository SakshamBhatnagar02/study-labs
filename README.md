# Study Labs (`io.study.labs`)

### AI-Powered Global Education, Study Clubs & Teacher Platform — **study.io**

> **Version**: `1.1.0` (Phases 1–4 Client Complete · Pre-API Backend Integration Ready) · **Framework**: Expo SDK `~58.0.23` / React Native `0.88.1` / React `19.3.0` / TypeScript `~6.0.3`  
> **Verified Baseline**: `0` TS Errors · `30/30` Domain, RBAC & UI Invariant Tests Passing · `20/20` Expo Doctor Checks Passing · `29/29` Playwright E2E Checks Passing (`390×844` Light/Dark & `1280×800` Desktop)

---

## 1. Project Overview

**Study Labs** (`io.study.labs`, by **study.io**) is a cross-platform Android, Responsive Web, and iOS-ready educational ecosystem built for global school curricula (India CBSE/ICSE/State Boards, USA AP/SAT, UK GCSE/A-Level, IB/Cambridge, UAE, Singapore, Canada, Australia) and competitive STEM exams (JEE Main/Advanced, NEET UG, BITSAT, MHT-CET). Study Labs unifies:

1. **Practice & Custom Test Engine** (`single_mcq`, `multiple_mcq`, `numerical`, explicit Submit guard, 3-tier Hints with individual/master toggles, Pannable KaTeX math/tables, Practice Notes with idempotent LaTeX conversion, Custom Test Builder & Question CRUD, Rank/Percentile Projection, Past Test Attempts History).
2. **Gemini AI Master Tutor & STEM Visual Studio** (Manual/Auto model router, Google Search grounding citations, Multimodal PDF/PPTX/DOCX/Image/TXT preview & editor, AI STEM Diagram/Visual generator + Free/Pro/Ultra quota-tracked Image Library, animated waveform thinking indicator, message regenerate/edit/feedback & session history).
3. **Global Curriculum Suite, Smart Notebooks & Editable Syllabus Planner** (Chapter Notes, Summaries, Flowcharts, Mind Maps, Formula Sheets, `Detailed / Normal / Rapid` learning modes, Custom Syllabus CRUD, Live Clock + Geo-Timezone Holiday Calendar + `2–3` day Exam Reminders).
4. **Offline Coaching Tracker & Performance Analytics** (Manual Allen/FIITJEE/Aakash/School mock log CRUD, `+4/-1` quick counters, Percentage vs Rank separation, trend charts & weak-chapter recommendations).
5. **Academic Toolkit, Quick Calc & 6-Lab STEM Playground** (Floating Quick Scientific Calc overlay, 118-element Periodic Table + 18 IUPAC Groups + Molar Mass calculator, 10-category Unit + Baseline FX Currency Converter, Chemistry Reference Tables, 21 Physical Constants, 16-entry Reactivity Series, and 6-mode STEM Playground with Save to AI Image Library + 3D Lab Preview).
6. **Discord-Style Study Clubs, Community & Teacher/Institute Platform** (Server rail, categorized channels, 3-way channel access modes, 7-tier RBAC roles & Role Simulator, KaTeX channel chat + polls/resources/replies/verified answers, Peer Direct Messages, Clubs Directory & Creation Wizard, Anti-Spam/Reporting/Blocking, and Teacher Console for Assignments, Submissions Grading, Announcements & Attendance with strict non-presence disclaimer).
7. **Multi-Period Gamification & Onboarding Auth** (5 Leaderboard Timeframes, 6 League Tiers, Daily Challenges, Achievement Badges, Score Reminders, Contribution Heatmap, Global Onboarding & SSO Auth Preview).

---

## 2. Architecture & Source Layout (`62` Modules in `src/` + Root `App.tsx`)

> **Routing Note**: Study Labs intentionally uses a persistent stateful `14`-route `NavTab` switcher in [`App.tsx`](App.tsx) (`BottomNav.tsx`) with a mounted-but-hidden `TestEngineScreen` (`display: 'none'` when unfocused) so active quiz timers, drafts, and workspace state survive tab navigation across Calculator, AI Tutor, and Clubs.

```text
study-labs/
├── App.tsx                                    # Root shell, 14-view NavTab router, Quick Calc & Onboarding modals, web focus CSS fix
├── app.json                                   # Expo SDK 58 config, package io.study.labs, Cyber Orange icons
├── package.json                               # Dependencies & scripts
├── .env.example                               # Client environment template (Supabase + Gemini dev keys)
├── supabase/schema.sql                        # 13-table PostgreSQL schema + RLS templates (Core + Onboarding + Clubs + Teacher Suite)
├── scripts/verify-study-labs.mjs              # 30-assertion automated verification suite
├── assets/                                    # 13 files: 7 icons/branding images + 6 MP3 SFX in assets/audio/
│   └── audio/                                 # click, correct-answer, wrong-answer, test-complete, notification, calling
└── src/
    ├── theme/                                 # colors.ts (light/dark), tokens.ts (Cyber Orange #F97316 palette), index.tsx
    ├── types/                                 # index.ts (all domain, AI, Clubs, RBAC & Gamification contracts), assets.d.ts
    ├── data/
    │   ├── curriculumData.ts                  # Global curricula catalog, Chapters, Notes/MindMaps/Flowcharts, Chem tables, Sample Qs
    │   ├── clubsSeedData.ts                   # Pre-seeded Institutes/Study Clubs, RBAC roles, KaTeX posts, DMs, Assignments
    │   ├── periodicTable.ts                   # All 118 IUPAC elements + Groups 1–18 + f-block metadata + calculateMolarMass()
    │   └── academicConstants.ts               # 21 Physical Constants, 16-entry Reactivity Series & Baseline FX rates
    ├── services/
    │   ├── gemini.ts                          # Multi-model router, difficulty classifier, Web Search grounding, STEM visual gen + offline solver
    │   ├── supabase.ts                        # Remote `questions` & `offline_test_records` sync + offline graceful fallback
    │   ├── storage.ts                         # AsyncStorage persistence, v2 migrations, Clubs/Syllabus/Challenges/Attempts stores
    │   ├── soundManager.ts                    # 6 MP3 SFX via expo-audio + Web Audio oscillator fallback (MCQ-scoped click SFX)
    │   ├── hapticManager.ts                   # Expo Haptics honoring reduced-motion & settings
    │   └── celebrationManager.ts              # Personal-best detection & tier orchestration
    ├── utils/
    │   ├── activityStats.ts                   # Streak, heatmap, 7-day baseline stats & score reminder evaluator
    │   ├── aiImageLibrary.ts                  # SVG STEM generator, image annotations/transforms & Free/Pro/Ultra quotas
    │   ├── attachmentParser.ts                # Client ZIP/XML extractor (fflate) for PPTX/DOCX + PDF/TXT/Image intake
    │   ├── calendarHolidays.ts                # Intl timezone -> country resolver, offline holidays (7 countries) + Nager.Date sync
    │   ├── clubsEngine.ts                     # RBAC permission resolver, 3-way channel access, anti-spam, cohort stats, disclaimer constant
    │   ├── customTestBuilder.ts               # Filtering, multi-select serializer, numerical tolerance & rank projection
    │   ├── errorHandling.ts                   # API/resource error classifier, API-key redactor (`AIza*`/`AQ.*`/Bearer) & clone helper
    │   ├── gamificationEngine.ts              # 5-timeframe leaderboards, daily challenges, XP caps & achievement badges
    │   ├── mathEvaluator.ts                   # Injection-safe scientific evaluator (DEG/RAD, inverse trig, `!`, `%`)
    │   ├── mathFormatting.ts                  # Markdown + KaTeX compiler, Unicode normalizer, horizontal pan table wrapper
    │   └── noteLatexConverter.ts              # Idempotent plain-text-to-LaTeX converter
    ├── components/
    │   ├── ai/                                # AttachmentPreviewModal.tsx, ImageLibraryModal.tsx
    │   ├── auth/                              # OnboardingAuthModal.tsx (Global Curricula, Language, Avatar, Google/MS/Email SSO)
    │   ├── celebration/                       # CelebrationOverlay.tsx, ParticleCanvas.tsx, TrophyAnimation.tsx
    │   ├── clubs/                             # ChannelSettingsModal, ClubDirectoryModal, ClubPreviewModal, CreateClubModal, TeacherManagementModal
    │   ├── common/                            # AppIcon, Badge, Button, Card, DailyGoalModal, Header, MathRenderer, QuickCalculatorModal, StateFeedbackCard
    │   ├── navigation/                        # BottomNav.tsx (6 primary bottom tabs mapping 14 routed views)
    │   └── settings/                          # SettingsModal.tsx
    └── screens/                               # 14 routed screens (Dashboard, StudyMaterial, TestEngine, OfflineTracker, Analytics, SyllabusCalendar, GraphPlayground, AcademicTools, AIAssistant, Leaderboard, DailyGoal, Notebooks, Clubs, Profile)
```

---

## 3. Setup, Verification & Run Commands

```powershell
cd "c:\Users\bhatn\Downloads\Study Labs\study-labs"

# 1. Install dependencies (if fresh clone)
npm install

# 2. TypeScript check (expected: 0 errors)
.\node_modules\.bin\tsc.cmd --noEmit

# 3. Domain, Clubs RBAC, LaTeX, Multimodal & UI invariant verification suite (expected: 30/30 passing)
node scripts/verify-study-labs.mjs

# 4. Expo SDK dependency health check (expected: 20/20 passing)
npx expo-doctor

# 5. Launch Web or Android Dev Build
npm run web
npm run android
```

---

## 4. Database Setup & Pre-API Security Checklist

1. Copy `.env.example` to `.env` (never commit `.env` to Git):
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_GEMINI_API_KEY` *(dev prototyping only; move behind a Supabase Edge Function before production APK builds)*
2. Execute [`supabase/schema.sql`](supabase/schema.sql) in **Supabase Dashboard → SQL Editor** so `questions`, `profiles` (extended onboarding fields), `offline_test_records`, `custom_tests`, `syllabus_modules`, `clubs`, `club_roles`, `club_members`, `club_channels`, `club_messages`, `club_assignments`, `assignment_submissions`, `attendance_records`, and `safety_reports` exist (avoiding `/rest/v1/questions` `404` fallback on first boot).
3. See [`DEVELOPMENT_STATUS.md`](../DEVELOPMENT_STATUS.md) and [`AUDIT_CHECKLIST.md`](../AUDIT_CHECKLIST.md) for the complete **Phase 5 Backend APIs, Assets, Images & Contacts Checklist**.
