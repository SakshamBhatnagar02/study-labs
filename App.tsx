import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme';
import { Header } from './src/components/common/Header';
import { BottomNav, NavTab } from './src/components/navigation/BottomNav';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { StudyMaterialScreen } from './src/screens/StudyMaterialScreen';
import { AskAITutorPayload, TestEngineScreen } from './src/screens/TestEngineScreen';
import { OfflineTrackerScreen } from './src/screens/OfflineTrackerScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SyllabusCalendarScreen } from './src/screens/SyllabusCalendarScreen';
import { GraphPlaygroundScreen } from './src/screens/GraphPlaygroundScreen';
import { AcademicToolsScreen } from './src/screens/AcademicToolsScreen';
import { AIAssistantScreen } from './src/screens/AIAssistantScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { DailyGoalScreen } from './src/screens/DailyGoalScreen';
import { NotebooksScreen } from './src/screens/NotebooksScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ClubsScreen } from './src/screens/ClubsScreen';
import { EBooksScreen } from './src/screens/EBooksScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { AdminConsoleScreen } from './src/screens/AdminConsoleScreen';
import { QuickCalculatorModal } from './src/components/common/QuickCalculatorModal';
import { OnboardingAuthModal } from './src/components/auth/OnboardingAuthModal';
import { DEFAULT_USER, StorageService } from './src/services/storage';
import { SoundManager } from './src/services/soundManager';
import { aggregateDailyActivity, computeStreakAndWeek } from './src/utils/activityStats';
import { SubjectId, TestSessionLaunch, UserProfile } from './src/types';
import { ChevronLeft } from 'lucide-react-native';

function MainApp() {
  const { colors, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [hasMountedTestTab, setHasMountedTestTab] = useState(false);
  const [aiPrefillPrompt, setAiPrefillPrompt] = useState<AskAITutorPayload | null>(null);
  const [testLaunchSession, setTestLaunchSession] = useState<TestSessionLaunch | null>(null);
  const [customTestBuilderNonce, setCustomTestBuilderNonce] = useState(0);
  const [curriculumView, setCurriculumView] = useState<'chapters' | 'formulas'>('chapters');
  const [curriculumSubject, setCurriculumSubject] = useState<SubjectId>('physics');

  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [liveStreakDays, setLiveStreakDays] = useState<number>(DEFAULT_USER.studyStreakDays);
  const [quickCalcOpen, setQuickCalcOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'test' && !hasMountedTestTab) {
      setHasMountedTestTab(true);
    }
  }, [activeTab, hasMountedTestTab]);

  // Suppress sharp rectangular browser/Android focus outlines while keeping rounded clipping crisp
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const styleId = 'studylabs-web-focus-fix';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        * { -webkit-tap-highlight-color: transparent; }
        button:focus, button:focus-visible, button:active,
        [role="button"]:focus, [role="button"]:focus-visible, [role="button"]:active,
        [tabindex]:focus, [tabindex]:focus-visible, [tabindex]:active {
          outline: none !important;
        }
        input:focus, textarea:focus { outline: none; }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  useEffect(() => {
    const hydrateGlobals = async () => {
      const [settings, profile, goalCfg, logs] = await Promise.all([
        StorageService.getSettings(),
        StorageService.getUserProfile(),
        StorageService.getDailyGoalConfig(),
        StorageService.getAttemptLogs(),
      ]);
      SoundManager.setCachedSettings(settings);
      setUserProfile(profile);
      const streak = computeStreakAndWeek(
        aggregateDailyActivity(logs),
        goalCfg.targetQuestions,
        new Date(),
        profile.studyStreakDays
      );
      setLiveStreakDays(streak.currentStreakDays);
    };
    hydrateGlobals();
  }, [activeTab]);

  const isSubScreen = [
    'analytics',
    'syllabus',
    'playground',
    'leaderboard',
    'dailyGoal',
    'notebooks',
    'clubs',
    'profile',
    'ebooks',
    'community',
    'admin',
  ].includes(activeTab);

  const getSubScreenTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'Performance Analytics';
      case 'syllabus':
        return 'Syllabus & Planner';
      case 'playground':
        return 'STEM Graph Playground';
      case 'leaderboard':
        return 'Leaderboards & Challenges';
      case 'dailyGoal':
        return 'Daily Goal & Heatmap';
      case 'notebooks':
        return 'Notebooks & My Notes';
      case 'clubs':
        return 'Study Clubs & Institutes';
      case 'profile':
        return 'My Profile & Alerts';
      case 'ebooks':
        return 'Digital E-Books & Reader';
      case 'community':
        return 'Community & Doubt Exchange';
      case 'admin':
        return 'Admin Console & Telemetry';
      default:
        return '';
    }
  };

  const launchTestSession = (session: TestSessionLaunch) => {
    setHasMountedTestTab(true);
    setTestLaunchSession(session);
    setActiveTab('test');
  };

  const renderNonTestScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={setActiveTab}
            onOpenOnboarding={() => setOnboardingOpen(true)}
            onOpenCustomTest={() => {
              setHasMountedTestTab(true);
              setCustomTestBuilderNonce((n) => n + 1);
              setActiveTab('test');
            }}
            onOpenFormulas={(subj) => {
              if (subj) setCurriculumSubject(subj);
              setCurriculumView('formulas');
              setActiveTab('study');
            }}
            onOpenCurriculumSubject={(subj) => {
              setCurriculumSubject(subj);
              setCurriculumView('chapters');
              setActiveTab('study');
            }}
            onAskConcept={(concept) => {
              setAiPrefillPrompt({
                prompt: `Explain clearly with formulas and an example: ${concept}`,
                difficulty: 'Medium',
                subject: 'physics',
                nonce: Date.now(),
              });
              setActiveTab('ai');
            }}
          />
        );
      case 'study':
        return (
          <StudyMaterialScreen
            initialView={curriculumView}
            initialSubject={curriculumSubject}
            onLaunchSession={launchTestSession}
            onOpenNotebooks={() => setActiveTab('notebooks')}
            onOpenEBooks={() => setActiveTab('ebooks')}
            onOpenCommunity={() => setActiveTab('community')}
            onAskAITopic={(topicTitle, subjectId) => {
              setAiPrefillPrompt({
                prompt: `Give concise revision notes, key formulas, and common pitfalls for: ${topicTitle}`,
                difficulty: 'Medium',
                subject: subjectId,
                nonce: Date.now(),
              });
              setActiveTab('ai');
            }}
          />
        );
      case 'tracker':
        return <OfflineTrackerScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'syllabus':
        return <SyllabusCalendarScreen />;
      case 'playground':
        return <GraphPlaygroundScreen />;
      case 'tools':
        return <AcademicToolsScreen />;
      case 'ai':
        return <AIAssistantScreen prefillPrompt={aiPrefillPrompt} />;
      case 'leaderboard':
        return <LeaderboardScreen onStartPractice={() => setActiveTab('test')} />;
      case 'dailyGoal':
        return (
          <DailyGoalScreen
            onStartPractice={() => setActiveTab('test')}
            onOpenLeaderboard={() => setActiveTab('leaderboard')}
          />
        );
      case 'notebooks':
        return <NotebooksScreen onLaunchSession={launchTestSession} />;
      case 'clubs':
        return (
          <ClubsScreen
            onLaunchSession={launchTestSession}
            onOpenProfile={() => setActiveTab('profile')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onNavigate={setActiveTab}
            onOpenOnboarding={() => setOnboardingOpen(true)}
            onProfileUpdated={(updated) => setUserProfile(updated)}
          />
        );
      case 'ebooks':
        return <EBooksScreen onNavigate={setActiveTab} />;
      case 'community':
        return <CommunityScreen onNavigate={setActiveTab} />;
      case 'admin':
        return <AdminConsoleScreen onNavigate={setActiveTab} />;
      default:
        return <DashboardScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={['top', 'left', 'right']}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {/* Top Application Header */}
      <Header
        userIoId={userProfile.ioId}
        streakDays={liveStreakDays}
        onProfilePress={() => setActiveTab('profile')}
        onStreakPress={() => setActiveTab('dailyGoal')}
        onLeaderboardPress={() => setActiveTab('leaderboard')}
        onClubsPress={() => setActiveTab('clubs')}
        onQuickCalcPress={() => setQuickCalcOpen(true)}
      />

      {/* Sub-screen Navigation Bar */}
      {isSubScreen && (
        <View style={[styles.subHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab('dashboard');
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back to Home</Text>
          </TouchableOpacity>
          <Text style={[styles.subHeaderTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {getSubScreenTitle()}
          </Text>
        </View>
      )}

      {/* Screen Body */}
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        {activeTab !== 'test' && renderNonTestScreen()}
        {hasMountedTestTab && (
          <View
            style={[
              styles.testKeepAliveWrap,
              activeTab !== 'test' && styles.hiddenTab,
            ]}
          >
            <TestEngineScreen
              isFocused={activeTab === 'test'}
              initialSession={testLaunchSession}
              openBuilderNonce={customTestBuilderNonce}
              onBuilderOpened={() => setCustomTestBuilderNonce(0)}
              onAskAI={(payload) => {
                setAiPrefillPrompt(payload);
                setActiveTab('ai');
              }}
            />
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Global Popup Quick Calculator */}
      <QuickCalculatorModal
        visible={quickCalcOpen}
        onClose={() => setQuickCalcOpen(false)}
        onOpenFullTools={() => setActiveTab('tools')}
      />

      {/* Global Onboarding, Curriculum, Language & Account SSO Setup */}
      <OnboardingAuthModal
        visible={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        initialProfile={userProfile}
        onSaved={(updated) => setUserProfile(updated)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  testKeepAliveWrap: {
    flex: 1,
  },
  hiddenTab: {
    display: 'none',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    marginLeft: 10,
  },
});
