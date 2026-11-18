import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme';
import { Header } from './src/components/common/Header';
import { BottomNav, NavTab } from './src/components/navigation/BottomNav';
import { DesktopSidebar } from './src/components/navigation/DesktopSidebar';
import { SideDrawerModal } from './src/components/navigation/SideDrawerModal';
import { SettingsModal } from './src/components/settings/SettingsModal';
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
import { PYQExplorerScreen } from './src/screens/PYQExplorerScreen';
import { ExamCalendarScreen } from './src/screens/ExamCalendarScreen';
import { QuickCalculatorModal } from './src/components/common/QuickCalculatorModal';
import { OnboardingAuthModal } from './src/components/auth/OnboardingAuthModal';
import { WelcomeOnboardingScreen } from './src/components/auth/WelcomeOnboardingScreen';
import { DEFAULT_USER, StorageService } from './src/services/storage';
import { SoundManager } from './src/services/soundManager';
import { UserWorkspaceService } from './src/services/userWorkspaceService';
import { BRANDING_ASSETS } from './src/utils/avatarHelper';
import { aggregateDailyActivity, computeStreakAndWeek } from './src/utils/activityStats';
import { SubjectId, TestSessionLaunch, UserProfile } from './src/types';
import { ChevronLeft } from 'lucide-react-native';

function MainApp() {
  const { colors, mode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktopShell = width >= 768;
  const isWideDesktop = width >= 1024;
  const [sidebarPrefCollapsed, setSidebarPrefCollapsed] = useState<boolean | null>(null);
  const sidebarCollapsed = sidebarPrefCollapsed ?? !isWideDesktop;

  const [authHydrated, setAuthHydrated] = useState(false);
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSettingsOpen, setDrawerSettingsOpen] = useState(false);

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

  // MARKS Web PWA parity: Shift + D toggles Light / Dark theme on Web desktop
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      if (e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [toggleTheme]);

  useEffect(() => {
    let mounted = true;
    const hydrateGlobals = async () => {
      try {
        const [settings, profile, goalCfg, logs] = await Promise.all([
          StorageService.getSettings(),
          StorageService.getUserProfile(),
          StorageService.getDailyGoalConfig(),
          StorageService.getAttemptLogs(),
        ]);
        if (!mounted) return;
        SoundManager.setCachedSettings(settings);
        setUserProfile(profile);
        if (profile.onboardingCompleted) {
          // Ensure user's B2 + Supabase workspace folders are always initialized
          void UserWorkspaceService.provisionUserFolders(profile.id, profile.ioId);
        }
        const streak = computeStreakAndWeek(
          aggregateDailyActivity(logs),
          goalCfg.targetQuestions,
          new Date(),
          profile.studyStreakDays
        );
        setLiveStreakDays(streak.currentStreakDays);
      } finally {
        if (mounted) setAuthHydrated(true);
      }
    };
    hydrateGlobals();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const handleProfileSaved = (updated: UserProfile) => {
    setUserProfile(updated);
    if (updated.onboardingCompleted) {
      void UserWorkspaceService.provisionUserFolders(updated.id, updated.ioId);
    }
  };

  // 1. Clean splash while hydrating persisted auth/onboarding status (prevents Home flash!)
  if (!authHydrated) {
    return (
      <View style={styles.bootSplash}>
        <StatusBar style="light" />
        <Image
          source={BRANDING_ASSETS.appLogo}
          style={styles.bootLogo}
          resizeMode="contain"
        />
        <Text style={styles.bootTitle}>Study Labs</Text>
        <Text style={styles.bootSub}>study.io · Initializing Workspace...</Text>
      </View>
    );
  }

  // 2. Mandatory Full-Screen Onboarding Gate (User MUST sign in/sign up & complete onboarding wizard before accessing app!)
  const requiresAuthOnboarding =
    !userProfile.onboardingCompleted ||
    userProfile.isAuthenticated === false ||
    userProfile.authProvider === 'guest';

  if (requiresAuthOnboarding) {
    return (
      <View style={{ flex: 1, backgroundColor: '#05070E' }}>
        <StatusBar style="light" />
        <WelcomeOnboardingScreen
          initialProfile={userProfile}
          onAuthenticated={(nextProfile) => {
            handleProfileSaved(nextProfile);
          }}
        />
      </View>
    );
  }

  const isSubScreen = [
    'analytics',
    'syllabus',
    'playground',
    'leaderboard',
    'dailyGoal',
    'clubs',
    'profile',
    'ebooks',
    'community',
    'admin',
    'tracker',
  ].includes(activeTab);

  const getSubScreenTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'Performance Analytics';
      case 'syllabus':
        return 'Syllabus & Planner';
      case 'playground':
        return '3D STEM Lab';
      case 'leaderboard':
        return 'Leaderboards & Leagues';
      case 'dailyGoal':
        return 'Your Daily Goal';
      case 'notebooks':
        return 'Notebooks & My Notes';
      case 'clubs':
        return 'Study Clubs & Institutes';
      case 'profile':
        return 'My Profile & Cloud Folders';
      case 'ebooks':
        return 'Digital E-Books & Syllabi';
      case 'community':
        return 'Community & Doubt Exchange';
      case 'admin':
        return 'Admin Console & Telemetry';
      case 'tracker':
        return 'Offline Coaching Tracker';
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
            onOpenDrawer={() => setDrawerOpen(true)}
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
        return <AcademicToolsScreen onNavigate={setActiveTab} />;
      case 'pyqs':
        return (
          <PYQExplorerScreen
            onBack={() => setActiveTab('dashboard')}
            onLaunchMockTest={(qs, title) =>
              launchTestSession({
                title,
                questionIds: qs.map((q) => q.id),
                mode: 'exam',
                nonce: Date.now(),
              })
            }
          />
        );
      case 'calendar':
        return (
          <ExamCalendarScreen
            onBack={() => setActiveTab('dashboard')}
            onOpenSyllabus={() => setActiveTab('ebooks')}
          />
        );
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
            onProfileUpdated={handleProfileSaved}
            onAccountDeleted={() => {
              setActiveTab('dashboard');
              setUserProfile({ ...DEFAULT_USER, onboardingCompleted: false });
            }}
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

  const getPageTitle = (): string => {
    const sub = getSubScreenTitle();
    if (sub) return sub;
    switch (activeTab) {
      case 'dashboard':
        return 'Home Dashboard';
      case 'pyqs':
        return 'Chapter-wise PYQ Bank';
      case 'test':
        return 'Study Labs Tests';
      case 'study':
        return 'Learn & Formula Decks';
      case 'notebooks':
        return 'Notebooks & My Notes';
      case 'ai':
        return 'HOLO AI Tutor';
      case 'tools':
        return 'STEM Tools & Calculators';
      case 'calendar':
        return 'Global Exam Calendar';
      default:
        return 'Study Labs';
    }
  };

  const isWideCanvasTab = activeTab === 'test' || activeTab === 'playground' || activeTab === 'ai';
  const desktopContentMaxWidth = isWideCanvasTab ? 1140 : 920;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDesktopShell ? colors.background : colors.card },
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.appShell, isDesktopShell && styles.appShellDesktop]}>
        {/* MARKS Web PWA Desktop/Tablet Persistent Left Sidebar (256px expanded / 72px collapsed) */}
        {isDesktopShell && (
          <DesktopSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarPrefCollapsed((prev) => !(prev ?? !isWideDesktop))}
            profile={userProfile}
            streakDays={liveStreakDays}
            onOpenSettings={() => setDrawerSettingsOpen(true)}
          />
        )}

        {/* Right Main Column (Full-width on Mobile, fluid minmax(0,1fr) on PC) */}
        <View style={[styles.mainColumn, { backgroundColor: colors.background }]}>
          {/* Top Application Header */}
          <Header
            userIoId={userProfile.ioId}
            streakDays={liveStreakDays}
            desktopMode={isDesktopShell}
            pageTitle={getPageTitle()}
            onMenuPress={() => setDrawerOpen(true)}
            onProfilePress={() => setActiveTab('profile')}
            onStreakPress={() => setActiveTab('dailyGoal')}
            onLeaderboardPress={() => setActiveTab('leaderboard')}
            onClubsPress={() => setActiveTab('clubs')}
            onQuickCalcPress={() => setQuickCalcOpen(true)}
          />

          {/* Sub-screen Navigation Bar */}
          {isSubScreen && (
            <View style={[styles.subHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <View
                style={[
                  styles.subHeaderInner,
                  isDesktopShell && { maxWidth: desktopContentMaxWidth, alignSelf: 'center', width: '100%' },
                ]}
              >
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
            </View>
          )}

          {/* Screen Body (Centered Max-Width Workspace on PC, Full-Bleed on Mobile) */}
          <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.workspaceMeasure,
                isDesktopShell && {
                  maxWidth: desktopContentMaxWidth,
                  alignSelf: 'center',
                  width: '100%',
                  paddingHorizontal: 12,
                },
              ]}
            >
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
          </View>

          {/* Bottom Navigation: Mobile Only (Hidden on Desktop/Tablet where Left Sidebar is active!) */}
          {!isDesktopShell && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
        </View>
      </View>

      {/* MARKS-Style Left Side Drawer (Mobile) */}
      <SideDrawerModal
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={userProfile}
        onNavigate={setActiveTab}
        onOpenSettings={() => setDrawerSettingsOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Drawer-Triggered Global Settings Modal */}
      <SettingsModal
        visible={drawerSettingsOpen}
        onClose={() => setDrawerSettingsOpen(false)}
        onOpenReminderSettings={() => {
          setDrawerSettingsOpen(false);
          setActiveTab('dailyGoal');
        }}
      />

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
        onSaved={handleProfileSaved}
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
  appShell: {
    flex: 1,
    flexDirection: 'column',
  },
  appShellDesktop: {
    flexDirection: 'row',
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  workspaceMeasure: {
    flex: 1,
    width: '100%',
  },
  subHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  bootSplash: {
    flex: 1,
    backgroundColor: '#05070E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootLogo: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  bootTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  bootSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '600',
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
