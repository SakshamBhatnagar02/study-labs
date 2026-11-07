import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme';
import { Header } from './src/components/common/Header';
import { BottomNav, NavTab } from './src/components/navigation/BottomNav';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { StudyMaterialScreen } from './src/screens/StudyMaterialScreen';
import { TestEngineScreen } from './src/screens/TestEngineScreen';
import { OfflineTrackerScreen } from './src/screens/OfflineTrackerScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SyllabusCalendarScreen } from './src/screens/SyllabusCalendarScreen';
import { GraphPlaygroundScreen } from './src/screens/GraphPlaygroundScreen';
import { AcademicToolsScreen } from './src/screens/AcademicToolsScreen';
import { AIAssistantScreen } from './src/screens/AIAssistantScreen';
import { ChevronLeft } from 'lucide-react-native';

function MainApp() {
  const { colors, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  const isSubScreen = ['analytics', 'syllabus', 'playground'].includes(activeTab);

  const getSubScreenTitle = () => {
    switch (activeTab) {
      case 'analytics':
        return 'Performance Analytics';
      case 'syllabus':
        return 'Syllabus & Planner';
      case 'playground':
        return 'STEM Graph Playground';
      default:
        return '';
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setActiveTab} />;
      case 'study':
        return <StudyMaterialScreen />;
      case 'test':
        return <TestEngineScreen />;
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
        return <AIAssistantScreen />;
      default:
        return <DashboardScreen onNavigate={setActiveTab} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={['top', 'left', 'right']}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      
      {/* Top Application Header */}
      <Header userIoId="STUDY-7734-IO" streakDays={14} />

      {/* Sub-screen Navigation Bar */}
      {isSubScreen && (
        <View style={[styles.subHeader, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
          <TouchableOpacity 
            onPress={() => setActiveTab('dashboard')} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back to Home</Text>
          </TouchableOpacity>
          <Text style={[styles.subHeaderTitle, { color: colors.textPrimary }]}>{getSubScreenTitle()}</Text>
        </View>
      )}

      {/* Screen Body */}
      <View style={[styles.screenContainer, { backgroundColor: colors.background }]}>
        {renderActiveScreen()}
      </View>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
});
