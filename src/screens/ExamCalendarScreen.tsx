import React, { useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import {
  NATIONAL_EXAMS_CALENDAR,
  NationalExamMeta,
} from '../data/examCalendarData';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Sparkles,
} from 'lucide-react-native';

interface ExamCalendarScreenProps {
  onBack: () => void;
  onOpenSyllabus?: (fileName: string) => void;
}

export const ExamCalendarScreen: React.FC<ExamCalendarScreenProps> = ({
  onBack,
  onOpenSyllabus,
}) => {
  const { colors, mode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredExams = useMemo(() => {
    if (selectedCategory === 'all') return NATIONAL_EXAMS_CALENDAR;
    return NATIONAL_EXAMS_CALENDAR.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const computeDaysLeft = (targetDateStr: string): number => {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleOpenUrl = (url: string) => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            National Exam Calendar
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            Official NTA, IIT & BITS Schedules · Milestones & Countdowns
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Filter Chips */}
        <View style={styles.categoryRow}>
          {(['all', 'engineering', 'medical', 'general'] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            const label =
              cat === 'all'
                ? 'All Exams'
                : cat === 'engineering'
                ? 'Engineering'
                : cat === 'medical'
                ? 'Medical'
                : 'Central Univ.';
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  SoundManager.play('click');
                  HapticManager.triggerSelection();
                  setSelectedCategory(cat);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? mode === 'dark'
                        ? '#2A1711'
                        : '#FFEDD5'
                      : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isSelected ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Exams List */}
        <View style={{ gap: 16 }}>
          {filteredExams.map((exam) => {
            // Find next upcoming date
            const upcomingDates = exam.dates
              .map((d) => ({ ...d, daysLeft: computeDaysLeft(d.date) }))
              .filter((d) => d.daysLeft >= 0)
              .sort((a, b) => a.daysLeft - b.daysLeft);

            const nextEvent = upcomingDates[0] || null;

            return (
              <Card
                key={exam.id}
                style={[
                  styles.examCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: exam.color,
                  },
                ]}
              >
                {/* Top Strip */}
                <View style={styles.examCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.examShortName, { color: exam.color }]}>
                        {exam.shortName}
                      </Text>
                      <Badge label={exam.category.toUpperCase()} variant="primary" size="sm" />
                    </View>
                    <Text style={[styles.examFullName, { color: colors.text }]}>
                      {exam.name}
                    </Text>
                    <Text style={[styles.conductingText, { color: colors.textSecondary }]}>
                      Conducted by: {exam.conductingBody}
                    </Text>
                  </View>

                  {nextEvent && (
                    <View
                      style={[
                        styles.countdownBox,
                        {
                          backgroundColor:
                            mode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : '#F1F5F9',
                          borderColor: exam.color,
                        },
                      ]}
                    >
                      <Clock size={13} color={exam.color} />
                      <Text style={[styles.countdownDays, { color: exam.color }]}>
                        {nextEvent.daysLeft}d left
                      </Text>
                    </View>
                  )}
                </View>

                {/* Eligibility */}
                <View
                  style={[
                    styles.eligibilityBox,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.eligibilityText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Eligibility: </Text>
                    {exam.eligibility}
                  </Text>
                </View>

                {/* Milestone Timeline */}
                <View style={styles.timelineSection}>
                  <Text style={[styles.timelineHeading, { color: colors.textSecondary }]}>
                    OFFICIAL DATES & MILESTONES
                  </Text>
                  <View style={styles.timelineList}>
                    {exam.dates.map((dateObj, idx) => {
                      const daysLeft = computeDaysLeft(dateObj.date);
                      const isPast = daysLeft < 0;
                      const isImminent = daysLeft >= 0 && daysLeft <= 14;

                      return (
                        <View key={idx} style={styles.timelineItem}>
                          <View
                            style={[
                              styles.timelineDot,
                              {
                                backgroundColor: isPast
                                  ? colors.border
                                  : isImminent
                                  ? colors.warning
                                  : exam.color,
                              },
                            ]}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.timelineLabel,
                                {
                                  color: isPast ? colors.textSecondary : colors.text,
                                  textDecorationLine: isPast ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              {dateObj.label}
                            </Text>
                            <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                              {dateObj.date} {dateObj.tentative ? '(Tentative)' : ''}
                            </Text>
                          </View>
                          {daysLeft >= 0 ? (
                            <Badge
                              label={`${daysLeft}d`}
                              variant={isImminent ? 'warning' : 'info'}
                              size="sm"
                            />
                          ) : (
                            <Badge label="Past" variant="neutral" size="sm" />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.examCardActions}>
                  {exam.syllabusAvailable && exam.syllabusFileName && onOpenSyllabus && (
                    <Button
                      title="View Official Syllabus"
                      variant="outline"
                      size="sm"
                      icon={<FileText size={14} color={colors.primary} />}
                      onPress={() => onOpenSyllabus(exam.syllabusFileName!)}
                      style={{ flex: 1 }}
                    />
                  )}
                  <Button
                    title="Official Portal"
                    variant="ghost"
                    size="sm"
                    icon={<ExternalLink size={14} color={colors.primary} />}
                    onPress={() => handleOpenUrl(exam.officialUrl)}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  examCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  examCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  examShortName: {
    fontSize: 16,
    fontWeight: '900',
  },
  examFullName: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  conductingText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  countdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  countdownDays: {
    fontSize: 12,
    fontWeight: '800',
  },
  eligibilityBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  eligibilityText: {
    fontSize: 12,
    lineHeight: 17,
  },
  timelineSection: {
    gap: 8,
  },
  timelineHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  timelineList: {
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 11,
  },
  examCardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
});
