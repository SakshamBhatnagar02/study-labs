import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SUBJECTS, CHAPTERS } from '../data/curriculumData';
import { SubjectId } from '../types';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Flame
} from 'lucide-react-native';

export const StudyMaterialScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [activeSubject, setActiveSubject] = useState<SubjectId>('physics');
  const [learningMode, setLearningMode] = useState<'Detailed' | 'Normal' | 'Rapid Revision'>('Normal');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>('ch_p_01');

  const filteredChapters = CHAPTERS.filter((c) => c.subjectId === activeSubject);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Breadcrumb & Curriculum Hierarchy */}
      <View style={[styles.hierarchyHeader, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
        <Text style={[styles.hierarchyPath, { color: colors.textSecondary }]}>
          India ❯ CBSE & JEE Main ❯ Class 12 ❯ Science (PCM)
        </Text>

        {/* 3 Learning Modes Switcher */}
        <View style={[styles.modeTabs, { backgroundColor: mode === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
          {(['Detailed', 'Normal', 'Rapid Revision'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setLearningMode(m)}
              style={[
                styles.modeTab,
                learningMode === m && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  { color: learningMode === m ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subject Filter Bar */}
      <View style={styles.subjectBar}>
        {SUBJECTS.map((sub) => {
          const isActive = activeSubject === sub.id;
          return (
            <TouchableOpacity
              key={sub.id}
              activeOpacity={0.7}
              onPress={() => {
                setActiveSubject(sub.id);
                const first = CHAPTERS.find((c) => c.subjectId === sub.id);
                setExpandedChapterId(first?.id || null);
              }}
              style={[
                styles.subjectChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  { color: isActive ? '#FFFFFF' : colors.text },
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chapters & Topics List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredChapters.map((chapter) => {
          const isExpanded = expandedChapterId === chapter.id;
          const percent = Math.round((chapter.completedQuestions / chapter.totalQuestions) * 100);

          return (
            <Card key={chapter.id} style={styles.chapterCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                style={styles.chapterHeader}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Badge label={`CHAPTER ${chapter.chapterNumber}`} variant="primary" size="sm" />
                    {chapter.highYield && (
                      <Badge label="HIGH YIELD" variant="warning" size="sm" />
                    )}
                  </View>
                  <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                  <Text style={[styles.chapterStats, { color: colors.textSecondary }]}>
                    {chapter.completedQuestions} / {chapter.totalQuestions} Questions Done · {percent}%
                  </Text>
                </View>

                {isExpanded ? (
                  <ChevronUp size={20} color={colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              {/* Collapsible Topics List */}
              {isExpanded && (
                <View style={[styles.topicsContainer, { borderTopColor: colors.borderSubtle }]}>
                  {chapter.topics.map((topic, index) => (
                    <View
                      key={topic.id}
                      style={[
                        styles.topicRow,
                        { borderBottomColor: index === chapter.topics.length - 1 ? 'transparent' : colors.borderSubtle },
                      ]}
                    >
                      <View style={styles.topicCheckIcon}>
                        {topic.isCompleted ? (
                          <CheckCircle2 size={18} color={colors.success} />
                        ) : (
                          <Circle size={18} color={colors.border} />
                        )}
                      </View>

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.topicTitle, { color: colors.text }]}>{topic.title}</Text>
                        <View style={styles.topicMeta}>
                          <Text style={[styles.topicSubText, { color: colors.textSecondary }]}>
                            {topic.pyqCount} PYQs
                          </Text>
                          <Text style={[styles.topicDot, { color: colors.textSecondary }]}>·</Text>
                          <Text style={[styles.topicSubText, { color: colors.textSecondary }]}>
                            {topic.revisionCount} Revisions
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity style={[styles.notesBtn, { backgroundColor: mode === 'dark' ? '#1E293B' : '#F1F5F9' }]}>
                        <FileText size={14} color={colors.primary} />
                        <Text style={[styles.notesBtnText, { color: colors.primary }]}>Notes</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hierarchyHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  hierarchyPath: {
    fontSize: 11,
    fontWeight: '600',
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subjectChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },
  chapterCard: {
    padding: 16,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  chapterStats: {
    fontSize: 12,
  },
  topicsContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topicCheckIcon: {
    width: 24,
    alignItems: 'center',
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topicSubText: {
    fontSize: 11,
  },
  topicDot: {
    fontSize: 11,
  },
  notesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  notesBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

