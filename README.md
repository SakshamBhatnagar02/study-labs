# Study Labs (`io.study.labs`)

### AI-Powered Global Education, Study Clubs & Teacher Platform — **study.io**

> **Version**: `1.3.0` (EAS Cloud Build, Resend, Cloudflare, Backblaze B2, Abstract API & Animated Emoji Ready) · **Framework**: Expo SDK `~58.0.23` / React Native `0.88.1` / React `19.3.0` / TypeScript `~6.0.3`  
> **Verified Baseline**: `0` TS Errors · `42/42` Domain, RBAC, 3D STEM Labs, E-Books, Cloud APIs & Security Invariant Tests Passing · `19/20` Expo Doctor Project Checks Passing

---

## 1. Project Overview

**Study Labs** (`io.study.labs`, by **study.io**) is a cross-platform Android, Responsive Web, and iOS-ready educational ecosystem built for global school curricula (India CBSE/ICSE/State Boards, USA AP/SAT, UK GCSE/A-Level, IB/Cambridge, UAE, Singapore, Canada, Australia) and competitive STEM exams (JEE Main/Advanced, NEET UG, BITSAT, MHT-CET). Study Labs unifies:

1. **Practice & Custom Test Engine** (`single_mcq`, `multiple_mcq`, `numerical`, explicit Submit guard, 3-tier Hints with individual/master toggles, Pannable KaTeX math/tables, Practice Notes with idempotent LaTeX conversion, Custom Test Builder & Question CRUD, Rank/Percentile Projection, Past Test Attempts History).
2. **Gemini AI Master Tutor & STEM Visual Studio** (Manual/Auto model router, Google Search grounding citations, Multimodal PDF/PPTX/DOCX/Image/TXT preview & editor, AI STEM Diagram/Visual generator + Free/Pro/Ultra quota-tracked Image Library, animated waveform thinking indicator, message regenerate/edit/feedback & session history).
3. **Global Curriculum Suite, Smart Notebooks & Editable Syllabus Planner** (Chapter Notes, Summaries, Flowcharts, Mind Maps, Formula Sheets, `Detailed / Normal / Rapid` learning modes, Custom Syllabus CRUD, Live Clock + Geo-Timezone Holiday Calendar + `2–3` day Exam Reminders).
4. **Offline Coaching Tracker & Performance Analytics** (Manual Allen/FIITJEE/Aakash/School mock log CRUD, `+4/-1` quick counters, Percentage vs Rank separation, trend charts & weak-chapter recommendations).
5. **Academic Toolkit, Quick Calc & Interactive 3D STEM Lab** (Floating Quick Scientific Calc overlay, 118-element Periodic Table + 18 IUPAC Groups + Molar Mass calculator, 10-category Unit + Baseline FX Currency Converter, Chemistry Reference Tables, 21 Physical Constants, 16-entry Reactivity Series, and 4 Parameter-Driven 3D Working Labs: Molecular Chemistry, Lorentz Force Helical Simulator, 3D Kinematics Projectiles with Air Drag, and Solid-State Crystal Lattices).
6. **Discord-Style Study Clubs, Community & Teacher/Institute Platform** (Server rail, categorized channels, 3-way channel access modes, 7-tier RBAC roles & Role Simulator, KaTeX channel chat + polls/resources/replies/verified answers, Peer Direct Messages, Clubs Directory & Creation Wizard, Anti-Spam/Reporting/Blocking, and Teacher Console for Assignments, Submissions Grading, Announcements & Attendance with strict non-presence disclaimer).
7. **Digital E-Books Library & AI Book Companion** (7 Curated textbooks & strategy manuals covering JEE Main 2026, NEET UG 2026, NIST Cybersecurity, Incident Response, and Computer Science; TOC drawer, Light/Dark/Sepia reading themes, font sizing, in-book quizzes, and AI Book Companion panel).
8. **Community Hub & Doubt Exchange** (3-tab hub for Q&A doubts with KaTeX equations, voting with net upvote calculation, verified faculty answers, study notes sharing, resource uploads with client-side image compression, and Google Fonts Noto Animated Emoji reactions).
9. **Dedicated Admin Console** (Content moderation queue, security threat center for disposable email & password breach alerts, staff & role privileges, multi-cloud storage telemetry covering Backblaze B2, Cloudflare R2, and Supabase).
10. **Multi-Cloud Architecture & Security Invariants**:
    - **EAS Build & Expo Go**: Linked to EAS project ID `1ac12902-be7f-48d1-90e6-7079fcbdf18a`.
    - **Email Service (Resend)**: Transactional email delivery with 6-digit OTP verification and welcome sequences.
    - **Cloudflare Turnstile & R2**: Privacy-preserving anti-bot verification token and high-speed zero-egress object storage.
    - **Backblaze B2**: S3-compatible cloud storage wired with Master Application Key.
    - **Abstract API Email Reputation**: Active temporary/disposable inbox detection with popular domain whitelist (Gmail, Outlook, Yahoo, iCloud, Proton, EDU).
    - **Client-Side Image Compression**: Automatic downscaling for avatars and notes saving 70–90% storage space.
    - **Gravatar Integration**: Universal SHA-256 avatar and profile resolution.
    - **Google Fonts Noto Animated Emoji**: 60fps vector WebP animated reactions (`🔥`, `✨`, `❤️`, `👍`, `🎉`, `💯`, `💡`, `🚀`, `👏`, `🧠`, `🎯`).

---

## 2. Architecture & Source Layout

> **Routing Note**: Study Labs uses a persistent stateful `17`-route `NavTab` switcher in [`App.tsx`](App.tsx) (`BottomNav.tsx`) with a mounted-but-hidden `TestEngineScreen` (`display: 'none'` when unfocused) so active quiz timers, drafts, and workspace state survive tab navigation across Calculator, AI Tutor, and Clubs.

```text
study-labs/
├── App.tsx                                    # Root shell, 17-view NavTab router, Quick Calc & Onboarding modals
├── app.json                                   # Expo SDK 58 config, package io.study.labs, Cyber Orange icons
├── package.json                               # Dependencies & scripts
├── .env.example                               # Client environment template (Supabase + Gemini dev keys)
├── supabase/schema.sql                        # 13-table PostgreSQL schema + RLS templates
├── scripts/verify-study-labs.mjs              # 35-assertion automated verification suite
├── assets/
│   ├── audio/                                 # click, hint, message-send, message-received, correct, wrong, etc.
│   ├── avatars/                               # avatar-boy, avatar-girl, avatar-male-teacher, avatar-female-teacher
│   ├── books/                                 # Official syllabus & cybersecurity manuals
│   └── branding/                              # App logos, banners, watermarks, mascot
└── src/
    ├── theme/                                 # colors.ts (light/dark), tokens.ts (Cyber Orange palette)
    ├── types/                                 # Domain contracts, EBook, Community, Captcha, Admin alerts
    ├── data/
    │   ├── curriculumData.ts                  # Global curricula catalog, Chapters, MindMaps, Sample Qs
    │   ├── ebooksData.ts                      # 7 curated textbooks & manuals with KaTeX & quizzes
    │   ├── communitySeedData.ts               # Doubt exchange seed questions, solutions & notes
    │   ├── clubsSeedData.ts                   # Pre-seeded Institutes/Study Clubs, RBAC roles, Assignments
    │   ├── periodicTable.ts                   # 118 IUPAC elements + Groups 1–18 + f-block metadata
    │   └── academicConstants.ts               # 21 Physical Constants, 16 Reactivity series, FX rates
    ├── services/
    │   ├── cloudStorage.ts                    # Multi-cloud storage abstraction (Supabase, S3/R2, GCS, Local)
    │   ├── gemini.ts                          # Multi-model router, difficulty classifier, search grounding
    │   ├── storage.ts                         # AsyncStorage persistence, raw item access & caching
    │   ├── soundManager.ts                    # Audio SFX via expo-audio + Web Audio fallback
    │   └── hapticManager.ts                   # Expo Haptics honoring reduced-motion
    ├── utils/
    │   ├── avatarHelper.ts                    # Character avatar presets & source resolver
    │   ├── tempMailDetector.ts                # 150+ disposable email blacklist & domain validator
    │   ├── breachDetector.ts                  # Leaked password dictionary & entropy assessment
    │   ├── communityEngine.ts                 # Q&A doubt exchange CRUD & voting algorithms
    │   └── activityStats.ts                   # Streak, heatmap, 7-day baseline stats
    ├── components/
    │   ├── auth/                              # OnboardingAuthModal.tsx, CaptchaChallenge.tsx
    │   ├── ebooks/                            # EBookReaderModal.tsx
    │   └── common/                            # Header, MathRenderer, RichMathText, AppIcon, Card, Badge, Button
    └── screens/
        ├── AdminConsoleScreen.tsx             # 4-tab Admin & Security console
        ├── CommunityScreen.tsx                # Doubt exchange & community resources
        ├── EBooksScreen.tsx                   # Digital library & bookshelf
        ├── GraphPlaygroundScreen.tsx          # 4 parameter-driven 3D working STEM labs + 2D functions
        └── ...
```

---

## 3. Verification Commands

```powershell
cd "c:\Users\bhatn\Downloads\Study Labs\study-labs"
.\node_modules\.bin\tsc.cmd --noEmit   # 0 errors
node scripts/verify-study-labs.mjs      # 35/35 passing
```
