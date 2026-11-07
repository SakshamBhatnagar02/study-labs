# Study Labs (`io.study.labs`)
### AI-Powered Global Education & Student Productivity Platform
**study.io**

---

## 1. Project Overview

Study Labs is an original, scalable, modern education platform designed for students, teachers, educational institutions, and independent learners worldwide. It unifies competitive examination practice (e.g., JEE Main, JEE Advanced, NEET, BITSAT) and school curricula (CBSE, ICSE, State Boards, International) with institutional asset management and an intelligent AI study tutor.

---

## 2. Key Architecture & Features

### A. Design System (Warm Orange Identity)
- **Primary Orange**: `#F97316`
- **Secondary Orange**: `#EA580C`
- **Background Light**: `#FFF7ED`
- **Card Background Light**: `#FFFFFF`
- **Text Light Primary**: `#1F2937` | **Secondary**: `#64748B`
- **Success**: `#16A34A` | **Error**: `#DC2626`
- **Dark Background**: `#111827` | **Dark Cards**: `#1F2937`
- Dynamic light/dark theme toggle with persistent preference storage.

### B. Implemented Modules (Phase 1 MVP)

1. **Student Dashboard (`DashboardScreen`)**:
   - Hero status with 14-day streak counter and study metrics.
   - Continue Learning card with progress indicators.
   - Coaching average score and syllabus completion widgets.
   - Quick access to the Coaching Test Tracker and Academic Tools.

2. **Offline Coaching Test Tracker (`OfflineTrackerScreen`)**:
   - Manually record physical coaching institute tests (Allen, FIITJEE, Aakash, Resonance, School).
   - Real-time score calculation: $\text{Percentage} = \left(\frac{\text{Obtained Marks}}{\text{Maximum Marks}}\right) \times 100$.
   - Breakdown of Correct, Incorrect, and Unattempted questions.
   - Rank and batch size tracking.
   - Visual trend bar charts showing historical improvement over time.
   - Complete CRUD operations (Add, View, Filter, Delete) with local persistence.

3. **Performance Analytics (`AnalyticsScreen`)**:
   - Subject-wise accuracy breakdown (Physics, Chemistry, Math, Biology).
   - High-yield mastery identification vs. priority revision areas.
   - Time range filtering (7-day, 30-day, all-time).
   - Educational metric honesty banner (clarifying difference between percentage, percentile, and rank).

4. **Syllabus Tracker & Planner (`SyllabusCalendarScreen`)**:
   - Live exam countdowns (JEE Main Session 1, CBSE Class 12 Boards, NEET UG).
   - Target daily study goals with interactive completion toggles.
   - Curriculum syllabus completion meters per subject.
   - Smart notification reminders for upcoming mock examinations.

5. **STEM Graph & Diagram Playground (`GraphPlaygroundScreen`)**:
   - 2D mathematical function plotting ($f(x) = A \cdot \sin(Bx)$, quadratic parabolas, exponential curves).
   - Real-time parameter sliders (amplitude, frequency, scaling).
   - Physics kinematics simulations (projectile trajectory, damped SHM, velocity-time graph).
   - Organic chemistry structural explorer (Benzene resonance, Ethyl Ethanoate ester, Ethanol primary alcohol, Isobutane alkane).

6. **Test & Quiz Engine (`TestEngineScreen`)**:
   - Practice Mode (instant explanation reveal) vs. Timed Exam Mode.
   - Single MCQ and numerical value input questions.
   - Digital Question Navigation pill bar.
   - One-tap question bookmarking.
   - Configurable scoring (+4 correct, -1 negative marking, 0 unattempted).
   - Step-by-step solution sheets.

7. **Curriculum & Study Material (`StudyMaterialScreen`)**:
   - Structured hierarchy: *Country $\rightarrow$ Board $\rightarrow$ Class $\rightarrow$ Stream $\rightarrow$ Subject $\rightarrow$ Chapter $\rightarrow$ Topic*.
   - 3 Learning Modes: **Detailed Learning**, **Normal Learning**, and **Rapid Revision**.
   - Topic-level completion checklists with PYQ counts and revision counters.

8. **Academic Toolkit (`AcademicToolsScreen`)**:
   - **Scientific Calculator**: Trigonometric functions, logarithms, square roots, and basic operators.
   - **Interactive Periodic Table**: Visual grid of elements with atomic numbers, masses, electron configurations, and group/period modal details.
   - **Unit Converter**: Length, mass, and temperature conversions.
   - **Universal Physical Constants**: Table of constants ($c$, $h$, $e$, $G$, $R$, $N_A$, $k_B$, $\varepsilon_0$, $\mu_0$, etc.).
   - **Metal Reactivity Series**: Standard activity hierarchy with water/steam reaction characteristics.

9. **AI Study Assistant (`AIAssistantScreen`)**:
   - Powered by Gemini API with an offline fallback knowledge engine.
   - Multi-turn conversational interface.
   - Step-by-step academic problem breakdowns and high-yield exam tips.
   - Pre-configured quick-prompt suggestions.

---

## 3. Technology Stack & Android SDK Environment

- **Cross-Platform Framework**: React Native 0.88 & Expo SDK 58 (TypeScript)
- **Application ID**: `io.study.labs` (Android target 8.0+ / API 26+)
- **Android SDK Path**: `C:\Users\bhatn\AppData\Local\Android\Sdk`
- **Android Platform-Tools**: ADB v1.0.41 (37.0.1)
- **Android Platforms Installed**: `platforms;android-34`
- **Android Build Tools Installed**: `build-tools;34.0.0`
- **Responsive Web**: React Native Web with Metro bundler (Production web bundle exported in `dist/`)
- **Offline Persistence**: `@react-native-async-storage/async-storage` (v2.2.0)
- **Backend & Database**: Supabase JS client with offline fallback
- **AI Integration**: Gemini API (`gemini-1.5-flash`) with provider-independent abstraction

---

## 4. Setup & Running the Application

### Verify Environment:
```powershell
adb --version
adb devices
npx expo-doctor
```

### Development Server:
```bash
cd study-labs
npm run web       # Start responsive web preview in browser
npm run android   # Start on connected Android device or emulator
```

### Run Automated Domain & Logic Tests:
```bash
node scripts/verify-study-labs.mjs
```

### Production Build / Web Export:
```bash
npx expo export -p web
```
The exported static web bundle is saved in `study-labs/dist/`.

---

## 5. Security & Configuration
- Create `.env` based on `.env.example`:
  ```bash
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
  ```
- All secret credentials remain protected; the app gracefully operates offline in local mode when keys are omitted.
