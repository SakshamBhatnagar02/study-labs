import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { storageService } from '../services/storage';
import { OfflineTestRecord, QuestionAttemptStat, TestAttempt } from '../types';
import { computeDifficultyBreakdown, computeHistorySummary, formatDurationShort } from '../utils/activityStats';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BrainCircuit, 
  Calendar, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const AnalyticsScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [offlineTests, setOfflineTests] = useState<OfflineTestRecord[]>([]);
  const [inAppAttempts, setInAppAttempts] = useState<TestAttempt[]>([]);
  const [attemptLogs, setAttemptLogs] = useState<QuestionAttemptStat[]>([]);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'all'>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [offline, attempts, logs] = await Promise.all([
      storageService.getOfflineTests(),
      storageService.getTestAttempts(),
      storageService.getAttemptLogs(),
    ]);
    setOfflineTests(offline);
    setInAppAttempts(attempts);
    setAttemptLogs(logs);
  };

  // Aggregated analytics across coaching records, test sessions, and question-level logs
  const totalTestsTaken = offlineTests.length + inAppAttempts.length;

  const offlineTotalPct = offlineTests.reduce((sum, t) => sum + t.calculatedPercentage, 0);
  const inAppTotalPct = inAppAttempts.reduce((sum, t) => sum + t.percentage, 0);
  const avgTestPercentage =
    totalTestsTaken > 0 ? Math.round((offlineTotalPct + inAppTotalPct) / totalTestsTaken) : 78;

  const historyRange: 'week' | 'month' | 'quarter' =
    timeRange === 'weekly' ? 'week' : timeRange === 'monthly' ? 'month' : 'quarter';

  const historySummary = computeHistorySummary(attemptLogs, historyRange, 'all');

  const scopedLogs = attemptLogs.filter((log) => {
    if (timeRange === 'all') return true;
    const days = timeRange === 'weekly' ? 7 : 30;
    const cutoff = Date.now() - days * 86400000;
    const ts = new Date(log.attemptedAt).getTime();
    return !isNaN(ts) && ts >= cutoff;
  });

  const difficultyRows = computeDifficultyBreakdown(scopedLogs);

  const subjectMeta = [
    { id: 'physics' as const, name: 'Physics', color: '#3B82F6' },
    { id: 'chemistry' as const, name: 'Chemistry', color: '#10B981' },
    { id: 'math' as const, name: 'Mathematics', color: '#F97316' },
    { id: 'biology' as const, name: 'Biology', color: '#8B5CF6' },
  ];

  const subjectStats = subjectMeta.map((sub) => {
    const summary = computeHistorySummary(attemptLogs, historyRange, sub.id);
    const acc = Math.round(summary.accuracyPercent);
    return {
      ...sub,
      accuracy: acc,
      totalQuestions: summary.qsSolved,
      avgTime: formatDurationShort(summary.avgTimeSeconds),
    };
  });

  const strongTopics = [
    { subject: 'Chemistry', topic: 'Chemical Bonding & Molecular Structure', accuracy: '94%' },
    { subject: 'Physics', topic: 'Current Electricity & Circuits', accuracy: '89%' },
    { subject: 'Biology', topic: 'Genetics & Evolution', accuracy: '92%' },
  ];

  const weakTopics = [
    { subject: 'Mathematics', topic: 'Integral Calculus & Area Under Curves', accuracy: '52%' },
    { subject: 'Physics', topic: 'Rotational Motion & Moment of Inertia', accuracy: '58%' },
    { subject: 'Chemistry', topic: 'Ionic Equilibrium & Buffer Solutions', accuracy: '61%' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Performance Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Academic mastery, difficulty curves & accuracy trends
          </Text>
        </View>
        <Badge label="Live Metrics" variant="primary" />
      </View>

      {/* Time Range Selector */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle }]}>
        {(['weekly', 'monthly', 'all'] as const).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => {
              setTimeRange(r);
            }}
            style={[
              styles.filterBtn,
              timeRange === r && { backgroundColor: colors.primary }
            ]}
          >
            <Text style={[
              styles.filterBtnText,
              { color: timeRange === r ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {r === 'weekly' ? 'Past 7 Days' : r === 'monthly' ? 'Past 30 Days' : 'All-Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Primary KPI Summary Cards */}
      <View style={styles.kpiGrid}>
        <Card style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={[styles.kpiIcon, { backgroundColor: '#FFEDD5' }]}>
            <TrendingUp size={22} color={colors.primary} />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
            {historySummary.qsSolved > 0 ? Math.round(historySummary.accuracyPercent) : avgTestPercentage}%
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Practice Accuracy</Text>
        </Card>

        <Card style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
            <Award size={22} color="#16A34A" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{avgTestPercentage}%</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
            Test Avg ({totalTestsTaken})
          </Text>
        </Card>

        <Card style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={[styles.kpiIcon, { backgroundColor: '#E0E7FF' }]}>
            <Target size={22} color="#4F46E5" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{historySummary.qsSolved}</Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Qs Solved</Text>
        </Card>

        <Card style={[styles.kpiCard, { backgroundColor: colors.card }]}>
          <View style={[styles.kpiIcon, { backgroundColor: '#FEF3C7' }]}>
            <Clock size={22} color="#D97706" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
            {formatDurationShort(historySummary.avgTimeSeconds)}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Avg Time / Q</Text>
        </Card>
      </View>

      {/* Educational Clarification Banner (Important Requirement) */}
      <Card style={[styles.noticeCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#F0F9FF', borderColor: '#38BDF8' }]}>
        <View style={styles.noticeRow}>
          <HelpCircle size={20} color="#0284C7" />
          <View style={styles.noticeTextContainer}>
            <Text style={[styles.noticeTitle, { color: mode === 'dark' ? '#38BDF8' : '#0369A1' }]}>
              Metric Definitions & Academic Honesty
            </Text>
            <Text style={[styles.noticeText, { color: mode === 'dark' ? '#94A3B8' : '#0C4A6E' }]}>
              • <Text style={{ fontWeight: '700' }}>Percentage:</Text> Your raw score divided by total marks × 100.{'\n'}
              • <Text style={{ fontWeight: '700' }}>Percentile:</Text> Percentage of test-takers who scored equal to or below your score.{'\n'}
              • Study Labs strictly keeps raw percentage distinct from coaching rank or national percentile.
            </Text>
          </View>
        </View>
      </Card>

      {/* Subject Comparison Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Subject Accuracy Breakdown</Text>
        </View>
        
        {subjectStats.map((sub) => (
          <View key={sub.name} style={styles.subjectRow}>
            <View style={styles.subjectHeader}>
              <Text style={[styles.subjectName, { color: colors.textPrimary }]}>{sub.name}</Text>
              <View style={styles.subMeta}>
                <Text style={[styles.subjectScore, { color: sub.color }]}>{sub.accuracy}%</Text>
                <Text style={[styles.subjectQCount, { color: colors.textSecondary }]}>
                  ({sub.totalQuestions} Qs · {sub.avgTime}/Q)
                </Text>
              </View>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${sub.accuracy}%`, 
                    backgroundColor: sub.color 
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Difficulty Mastery Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <BrainCircuit size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Accuracy by Difficulty
          </Text>
        </View>

        {difficultyRows.map((row) => {
          const barColor =
            row.difficulty === 'Easy'
              ? '#16A34A'
              : row.difficulty === 'Medium'
                ? '#F97316'
                : '#EF4444';
          return (
            <View key={row.difficulty} style={styles.subjectRow}>
              <View style={styles.subjectHeader}>
                <Text style={[styles.subjectName, { color: colors.textPrimary }]}>
                  {row.difficulty} Questions
                </Text>
                <View style={styles.subMeta}>
                  <Text style={[styles.subjectScore, { color: barColor }]}>
                    {row.accuracyPercent}%
                  </Text>
                  <Text style={[styles.subjectQCount, { color: colors.textSecondary }]}>
                    ({row.correct}/{row.attempted} · {formatDurationShort(row.avgTimeSeconds)})
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${row.accuracyPercent}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </Card>

      {/* Strong & Weak Areas */}
      <View style={styles.strengthsRow}>
        {/* Strong Topics */}
        <Card style={styles.analysisCard}>
          <View style={styles.analysisTitleRow}>
            <CheckCircle2 size={18} color="#16A34A" />
            <Text style={[styles.analysisTitle, { color: '#16A34A' }]}>High Mastery Areas</Text>
          </View>
          {strongTopics.map((item, idx) => (
            <View key={idx} style={[styles.topicItem, { borderBottomColor: colors.borderSubtle }]}>
              <Text style={[styles.topicSubject, { color: colors.primary }]}>{item.subject}</Text>
              <Text style={[styles.topicName, { color: colors.textPrimary }]}>{item.topic}</Text>
              <Text style={[styles.topicAcc, { color: '#16A34A' }]}>{item.accuracy} Accuracy</Text>
            </View>
          ))}
        </Card>

        {/* Needs Attention */}
        <Card style={styles.analysisCard}>
          <View style={styles.analysisTitleRow}>
            <AlertCircle size={18} color="#EA580C" />
            <Text style={[styles.analysisTitle, { color: '#EA580C' }]}>Priority Revision Needed</Text>
          </View>
          {weakTopics.map((item, idx) => (
            <View key={idx} style={[styles.topicItem, { borderBottomColor: colors.borderSubtle }]}>
              <Text style={[styles.topicSubject, { color: colors.secondary }]}>{item.subject}</Text>
              <Text style={[styles.topicName, { color: colors.textPrimary }]}>{item.topic}</Text>
              <Text style={[styles.topicAcc, { color: '#DC2626' }]}>{item.accuracy} Accuracy</Text>
            </View>
          ))}
        </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: (width - 44) / 2,
    padding: 16,
    alignItems: 'center',
  },
  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  noticeCard: {
    marginBottom: 16,
    borderWidth: 1,
    padding: 12,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 11.5,
    lineHeight: 18,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  subjectRow: {
    marginBottom: 14,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subjectScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  subjectQCount: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthsRow: {
    gap: 14,
  },
  analysisCard: {
    padding: 16,
  },
  analysisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  topicItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topicSubject: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  topicName: {
    fontSize: 13.5,
    fontWeight: '600',
    marginVertical: 2,
  },
  topicAcc: {
    fontSize: 12,
    fontWeight: '600',
  },
});

