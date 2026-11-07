import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Circle, 
  Bell, 
  Flag, 
  Plus, 
  ChevronRight,
  BookOpen
} from 'lucide-react-native';

interface ExamCountdown {
  id: string;
  name: string;
  dateStr: string;
  targetDate: string; // ISO
  daysRemaining: number;
  category: string;
}

interface StudyGoal {
  id: string;
  title: string;
  subject: string;
  dueToday: boolean;
  isCompleted: boolean;
  durationMinutes: number;
}

export const SyllabusCalendarScreen: React.FC = () => {
  const { colors, mode } = useTheme();

  const [exams] = useState<ExamCountdown[]>([
    { id: '1', name: 'JEE Main Session 1', dateStr: 'Jan 24, 2025', targetDate: '2025-01-24', daysRemaining: 78, category: 'National Entrance' },
    { id: '2', name: 'CBSE Class 12 Physics Board', dateStr: 'Feb 18, 2025', targetDate: '2025-02-18', daysRemaining: 103, category: 'Board Exam' },
    { id: '3', name: 'NEET UG 2025', dateStr: 'May 04, 2025', targetDate: '2025-05-04', daysRemaining: 178, category: 'Medical Entrance' },
  ]);

  const [goals, setGoals] = useState<StudyGoal[]>([
    { id: 'g1', title: 'Complete 25 Numerical Questions on Rotational Dynamics', subject: 'Physics', dueToday: true, isCompleted: true, durationMinutes: 60 },
    { id: 'g2', title: 'Revise Aldehydes, Ketones & Carboxylic Acids Mindmap', subject: 'Chemistry', dueToday: true, isCompleted: false, durationMinutes: 45 },
    { id: 'g3', title: 'Solve 2023 PYQs for Definite Integrals', subject: 'Mathematics', dueToday: true, isCompleted: false, durationMinutes: 75 },
    { id: 'g4', title: 'Weekly Full-length Coaching Mock Test Review', subject: 'Full Syllabus', dueToday: false, isCompleted: false, durationMinutes: 90 },
  ]);

  const [syllabusModules, setSyllabusModules] = useState([
    {
      subject: 'Physics',
      color: '#3B82F6',
      completedChapters: 14,
      totalChapters: 28,
      recentTopic: 'Electromagnetic Induction & Faraday Laws',
      status: 'On Track',
    },
    {
      subject: 'Chemistry',
      color: '#10B981',
      completedChapters: 21,
      totalChapters: 30,
      recentTopic: 'Coordination Compounds & Crystal Field Theory',
      status: 'Ahead',
    },
    {
      subject: 'Mathematics',
      color: '#F97316',
      completedChapters: 11,
      totalChapters: 26,
      recentTopic: 'Differential Equations & Applications',
      status: 'Needs Acceleration',
    },
    {
      subject: 'Biology',
      color: '#8B5CF6',
      completedChapters: 24,
      totalChapters: 32,
      recentTopic: 'Biotechnology & Principles and Processes',
      status: 'On Track',
    },
  ]);

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isCompleted: !g.isCompleted } : g))
    );
  };

  const completedCount = goals.filter((g) => g.isCompleted).length;
  const goalProgress = Math.round((completedCount / goals.length) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Syllabus & Planner</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Countdown, study scheduler & syllabus tracking
          </Text>
        </View>
        <Badge label="Active Term" variant="info" />
      </View>

      {/* Exam Countdown Banners */}
      <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Exam Countdowns</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countdownScroll}>
        {exams.map((exam) => (
          <Card key={exam.id} style={[styles.countdownCard, { backgroundColor: colors.card }]}>
            <View style={styles.countdownTop}>
              <Badge label={exam.category} variant="primary" />
              <View style={styles.timerBadge}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.timerBadgeText, { color: colors.primary }]}>{exam.daysRemaining} days left</Text>
              </View>
            </View>
            <Text style={[styles.examName, { color: colors.textPrimary }]}>{exam.name}</Text>
            <View style={styles.examDateRow}>
              <CalendarIcon size={14} color={colors.textSecondary} />
              <Text style={[styles.examDate, { color: colors.textSecondary }]}>{exam.dateStr}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Daily Study Goals with Progress Bar */}
      <Card style={styles.goalsCard}>
        <View style={styles.goalsHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Today's Target Goals</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {completedCount} of {goals.length} completed ({goalProgress}%)
            </Text>
          </View>
          <TouchableOpacity style={[styles.addGoalBtn, { backgroundColor: colors.surface }]}>
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle }]}>
          <View style={[styles.progressBarFill, { width: `${goalProgress}%`, backgroundColor: colors.primary }]} />
        </View>

        {/* List of goals */}
        {goals.map((g) => (
          <TouchableOpacity
            key={g.id}
            onPress={() => toggleGoal(g.id)}
            style={[styles.goalItem, { borderBottomColor: colors.borderSubtle }]}
            activeOpacity={0.7}
          >
            {g.isCompleted ? (
              <CheckCircle size={22} color="#16A34A" />
            ) : (
              <Circle size={22} color={colors.border} />
            )}
            <View style={styles.goalTextContainer}>
              <Text
                style={[
                  styles.goalTitle,
                  {
                    color: g.isCompleted ? colors.textSecondary : colors.textPrimary,
                    textDecorationLine: g.isCompleted ? 'line-through' : 'none',
                  },
                ]}
              >
                {g.title}
              </Text>
              <View style={styles.goalMetaRow}>
                <Text style={[styles.goalSubject, { color: colors.primary }]}>{g.subject}</Text>
                <Text style={[styles.goalDuration, { color: colors.textSecondary }]}>• {g.durationMinutes} min</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Syllabus Completion Tracker */}
      <View style={styles.syllabusSectionHeader}>
        <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginBottom: 0 }]}>
          Curriculum Syllabus Coverage
        </Text>
        <Badge label="Curriculum Map" variant="neutral" />
      </View>

      {syllabusModules.map((mod) => {
        const pct = Math.round((mod.completedChapters / mod.totalChapters) * 100);
        return (
          <Card key={mod.subject} style={styles.syllabusCard}>
            <View style={styles.syllabusTop}>
              <View style={styles.subjectTitleRow}>
                <View style={[styles.dotIndicator, { backgroundColor: mod.color }]} />
                <Text style={[styles.syllabusSubject, { color: colors.textPrimary }]}>{mod.subject}</Text>
              </View>
              <Text style={[styles.syllabusPct, { color: mod.color }]}>{pct}%</Text>
            </View>

            <View style={[styles.progressBarBg, { backgroundColor: colors.borderSubtle, marginVertical: 8 }]}>
              <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: mod.color }]} />
            </View>

            <View style={styles.syllabusBottom}>
              <Text style={[styles.syllabusChapters, { color: colors.textSecondary }]}>
                {mod.completedChapters}/{mod.totalChapters} Chapters Finished
              </Text>
              <Badge 
                label={mod.status} 
                variant={mod.status === 'Ahead' ? 'success' : mod.status === 'On Track' ? 'primary' : 'warning'} 
              />
            </View>
            <View style={[styles.activeTopicBox, { backgroundColor: colors.surface }]}>
              <BookOpen size={14} color={colors.primary} />
              <Text style={[styles.activeTopicText, { color: colors.textPrimary }]} numberOfLines={1}>
                In Progress: {mod.recentTopic}
              </Text>
            </View>
          </Card>
        );
      })}

      {/* Reminder Callout */}
      <Card style={[styles.reminderCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#FEF3C7' }]}>
        <View style={styles.reminderRow}>
          <Bell size={20} color="#D97706" />
          <View style={styles.reminderTextContainer}>
            <Text style={[styles.reminderTitle, { color: '#B45309' }]}>Automated Smart Reminders</Text>
            <Text style={[styles.reminderDesc, { color: mode === 'dark' ? '#CBD5E1' : '#78350F' }]}>
              Push notifications are active for upcoming coaching mock tests 48 hours and 24 hours prior.
            </Text>
          </View>
        </View>
      </Card>
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  countdownScroll: {
    marginBottom: 20,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  countdownCard: {
    width: 250,
    padding: 16,
    marginRight: 12,
  },
  countdownTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  examName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  examDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examDate: {
    fontSize: 12,
  },
  goalsCard: {
    padding: 16,
    marginBottom: 20,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addGoalBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  goalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  goalSubject: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalDuration: {
    fontSize: 11,
  },
  syllabusSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syllabusCard: {
    padding: 16,
    marginBottom: 12,
  },
  syllabusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  syllabusSubject: {
    fontSize: 15,
    fontWeight: '700',
  },
  syllabusPct: {
    fontSize: 15,
    fontWeight: '800',
  },
  syllabusBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  syllabusChapters: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeTopicBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTopicText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  reminderCard: {
    padding: 14,
    marginTop: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  reminderDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});
