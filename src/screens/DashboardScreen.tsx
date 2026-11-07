import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { NavTab } from '../components/navigation/BottomNav';
import { 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  FileEdit, 
  Clock, 
  Flame,
  TrendingUp,
  BrainCircuit
} from 'lucide-react-native';

interface DashboardScreenProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { colors, mode } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Welcome Banner */}
      <Card style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Badge label="MISSION JEE 2025" variant="warning" size="sm" style={styles.heroBadge} />
          <Text style={styles.heroTitle}>Master Your Preparation</Text>
          <Text style={styles.heroSubtitle}>
            14-day study streak! You solved 42 questions this week with 82% accuracy.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.heroBtn, { backgroundColor: '#FFFFFF' }]}
              onPress={() => onNavigate('test')}
            >
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>Start Daily Drill</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Coaching Avg</Text>
            <TrendingUp size={18} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>79.7%</Text>
          <Text style={[styles.statSub, { color: colors.success }]}>+5.2% vs last month</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Syllabus Done</Text>
            <Target size={18} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>68%</Text>
          <Text style={[styles.statSub, { color: colors.textSecondary }]}>58 of 84 Chapters</Text>
        </Card>
      </View>

      {/* Continue Learning Widget */}
      <Text style={[styles.sectionHeading, { color: colors.text }]}>Continue Learning</Text>
      <Card style={styles.continueCard}>
        <View style={styles.continueRow}>
          <View style={[styles.subjectIndicator, { backgroundColor: colors.info }]} />
          <View style={styles.continueDetails}>
            <View style={styles.badgeRow}>
              <Badge label="PHYSICS" variant="info" size="sm" />
              <Badge label="CHAPTER 7" variant="neutral" size="sm" />
            </View>
            <Text style={[styles.continueTitle, { color: colors.text }]}>
              Rotational Motion & Moment of Inertia
            </Text>
            <Text style={[styles.continueProgressText, { color: colors.textSecondary }]}>
              98 / 145 Questions Completed · 67%
            </Text>
            {/* Custom Progress Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
              <View style={[styles.progressBarFill, { width: '67%', backgroundColor: colors.primary }]} />
            </View>
          </View>
        </View>

        <View style={styles.continueFooter}>
          <Button
            title="Resume PYQ Practice"
            size="sm"
            onPress={() => onNavigate('test')}
            icon={<ArrowRight size={14} color="#FFFFFF" />}
          />
        </View>
      </Card>

      {/* Offline Coaching Tracker Feature Spotlight */}
      <View style={styles.spotlightHeader}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Offline Coaching Tracker</Text>
        <TouchableOpacity onPress={() => onNavigate('tracker')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      <Card style={[styles.trackerSpotlightCard, { borderColor: colors.border }]}>
        <View style={styles.spotlightRow}>
          <View style={[styles.spotlightIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
            <FileEdit size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.spotlightTitle, { color: colors.text }]}>Log Offline Institute Marks</Text>
            <Text style={[styles.spotlightSubtitle, { color: colors.textSecondary }]}>
              Track tests from Allen, FIITJEE, Aakash, or School. Monitor negative marks & rank trends.
            </Text>
          </View>
        </View>
        <Button
          title="Open Coaching Test Tracker"
          variant="outline"
          size="sm"
          onPress={() => onNavigate('tracker')}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* AI Tutor Assistant Callout */}
      <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 20 }]}>AI Study Assistant</Text>
      <Card style={[styles.aiCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED', borderColor: colors.primary }]}>
        <View style={styles.aiRow}>
          <BrainCircuit size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.aiTitle, { color: colors.text }]}>Instant Concept Clarification</Text>
            <Text style={[styles.aiDesc, { color: colors.textSecondary }]}>
              Stuck on a tricky calculus question or organic mechanism? Ask your Study Labs AI Tutor.
            </Text>
          </View>
        </View>
        <Button
          title="Ask AI Study Tutor"
          variant="secondary"
          size="sm"
          onPress={() => onNavigate('ai')}
          icon={<Sparkles size={14} color="#FFFFFF" />}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* Quick Academic Tools Shortcuts */}
      <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 20 }]}>Academic Toolkit & Workspaces</Text>
      <View style={styles.toolsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
          onPress={() => onNavigate('analytics')}
        >
          <Text style={styles.toolIcon}>📊</Text>
          <Text style={[styles.toolTitle, { color: colors.text }]}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
          onPress={() => onNavigate('syllabus')}
        >
          <Text style={styles.toolIcon}>📅</Text>
          <Text style={[styles.toolTitle, { color: colors.text }]}>Syllabus</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
          onPress={() => onNavigate('playground')}
        >
          <Text style={styles.toolIcon}>📈</Text>
          <Text style={[styles.toolTitle, { color: colors.text }]}>Playground</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toolChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
          onPress={() => onNavigate('tools')}
        >
          <Text style={styles.toolIcon}>🧪</Text>
          <Text style={[styles.toolTitle, { color: colors.text }]}>Tools</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  heroContent: {
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: '#FED7AA',
    fontSize: 13,
    lineHeight: 18,
  },
  heroActions: {
    marginTop: 8,
    flexDirection: 'row',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  continueCard: {
    padding: 16,
    marginBottom: 16,
  },
  continueRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subjectIndicator: {
    width: 4,
    borderRadius: 2,
  },
  continueDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  continueProgressText: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  continueFooter: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trackerSpotlightCard: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  spotlightRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  spotlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  spotlightSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiCard: {
    padding: 16,
    borderWidth: 1,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  toolChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  toolIcon: {
    fontSize: 22,
  },
  toolTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

